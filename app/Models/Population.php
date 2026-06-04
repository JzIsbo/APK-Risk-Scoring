<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Population extends Model
{
    protected $fillable = [
        'name',
        'dti',
        'payment_delay',
        'credit_score',
        'age',
        'co_burden',
        'risk_score',
        'risk_level',
        'status',
        'co_class',
        'payment_pattern',
        'ps_ambc',
        'period'
    ];

    protected $casts = [
        'dti' => 'float',
        'payment_delay' => 'integer',
        'credit_score' => 'integer',
        'age' => 'integer',
        'co_burden' => 'float',
        'risk_score' => 'float',
    ];

    /**
     * Boot the model and register saving listener for automatic real-time calculation.
     */
    protected static function booted()
    {
        static::saving(function ($population) {
            $population->recalculateRisk();
        });
    }

    /**
     * Recalculate risk score and risk level based on database parameters.
     */
    public function recalculateRisk()
    {
        $parameters = RiskParameter::all();
        $totalWeightedScore = 0;
        $totalWeight = 0;

        foreach ($parameters as $param) {
            $key = $param->key;
            $value = $this->getAttribute($key);

            if ($value === null) {
                continue;
            }

            // Find matching criteria
            $matchingScore = 0;
            $criteria = $param->criteria ?? [];

            foreach ($criteria as $rule) {
                $min = isset($rule['min']) ? floatval($rule['min']) : -999999;
                $max = isset($rule['max']) ? floatval($rule['max']) : 999999;
                $score = isset($rule['score']) ? floatval($rule['score']) : 0;

                if ($value >= $min && $value <= $max) {
                    $matchingScore = $score;
                    break;
                }
            }

            // Add to total weighted score
            $totalWeightedScore += ($matchingScore * ($param->weight / 100));
            $totalWeight += $param->weight;
        }

        // Normalize if total weight isn't exactly 100% (though it should be)
        if ($totalWeight > 0 && abs($totalWeight - 100) > 0.01) {
            $this->risk_score = ($totalWeightedScore / $totalWeight) * 100;
        } else {
            $this->risk_score = $totalWeightedScore;
        }

        // Determine Risk Level dynamically from settings
        $lowThreshold = floatval(\App\Models\Setting::where('key', 'risk_low_threshold')->value('value') ?? 40);
        $mediumThreshold = floatval(\App\Models\Setting::where('key', 'risk_medium_threshold')->value('value') ?? 70);

        if ($this->risk_score < $lowThreshold) {
            $this->risk_level = 'Low';
        } elseif ($this->risk_score < $mediumThreshold) {
            $this->risk_level = 'Medium';
        } else {
            $this->risk_level = 'High';
        }
    }
}
