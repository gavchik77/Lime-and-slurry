# Lime, Slurry & Fertiliser Farm Planner v3

A GitHub Pages-ready training app for students, built as one simplified **well-drained dairy-farm case**.

## Case

- 40 ha total farm
- 32 ha grazing platform
- 8 ha first-cut silage
- 80 dairy cows
- measured slurry inventory: 1,000 m³
- cattle slurry at approximately 6% DM
- slurry applied by LESS
- mineral grassland soil
- one 8 ha grazing block is below target pH

The stock number is supplied as farm context. The exercise uses the **measured slurry-store volume** rather than deriving slurry quantity from cow numbers, because actual manure volume and nutrient content depend on housing, dilution and slurry DM.

## What the app teaches

1. Start with soil tests and lime.
2. Calculate lime requirement from SMP/buffer pH.
3. Apply the 7.5 t/ha maximum single-application rule.
4. Decide the correct lime/slurry sequence.
5. Apply the 2025 well-drained early-spring N strategy.
6. Calculate slurry volume needed from gal/ac and field area.
7. Track the slurry inventory.
8. Prioritise slurry to an Index-3 first-cut silage block.
9. Calculate slurry N contribution and the remaining chemical N requirement.
10. Calculate protected urea + S product rate.
11. Check first-cut N timing against a six-week pre-cut interval.
12. Record marks and attempts.

## Main Teagasc rules represented

### Lime

For grass-only mineral grassland, target soil pH is approximately 6.3.

The Teagasc SMP/buffer-pH approach uses:

```text
Lime requirement (t/ha)
= (target SMP pH - measured SMP pH) × 12.5
```

For grass, target SMP pH = 6.7.

Do not exceed 7.5 t lime/ha in one application.

### Lime interactions

Current Teagasc liming advice used in this exercise:

- slurry or unprotected urea first -> leave about 7 days before lime;
- lime first -> leave 3 months before slurry or unprotected urea;
- no interval is required between lime and protected urea.

### 2025 well-drained early-spring strategy

The source guideline splits the grazing area into:

- 40%
- 15%
- 15%
- 30%

with cattle slurry and protected urea applied in January/February/March to build total N by 1 April.

This app applies those percentages to the 32 ha grazing platform as a teaching simplification.

### Cattle slurry

The supplied material gives cattle slurry around 6% DM applied by LESS approximately:

- 1.0 kg available N/m³
- 0.5 kg P/m³
- 3.5 kg K/m³

### First-cut silage

The supplied 2025 teaching material uses a 5 t DM/ha crop requiring:

- 100 kg N/ha
- 20 kg P/ha at Index 3
- 125 kg K/ha at Index 3

It also advises that grass takes up about 2.5 kg N/ha/day and that N should be applied at least six weeks before cutting.

For Index-3 P and K soils, Teagasc guidance treats about 33 m³/ha of good-quality 6% DM cattle slurry as approximately sufficient for first-cut silage P and K. The exercise then balances the remaining N with a protected urea + S product assumed at 38% N.



## Version 3 visibility fix

The **Practice Generator is now visible immediately** and no longer requires completion of Lessons 1–6 before it appears.

The score dashboard should always show **7 rows**:

1. Lime requirement
2. Lime/slurry timing
3. Well-drained spring N plan
4. Slurry inventory
5. First-cut silage
6. Silage timing
7. Practice generator

A practice case is generated automatically when the page loads.

The page header also displays **Version 3** so it is easy to confirm that the newest files are being served by GitHub Pages.

## Weighted-average explanation

The app now explains the phrase **"Weighted average total N by 1 April"** directly below the question.

For the 32 ha grazing platform:

```text
(12.8 ha × 70 kg N/ha)
+ (4.8 ha × 75 kg N/ha)
+ (4.8 ha × 83 kg N/ha)
+ (9.6 ha × 79 kg N/ha)
= 2,412.8 kg N
```

Then:

```text
2,412.8 kg N / 32 ha = 75.4 kg N/ha
```

The weighting is necessary because the four N rates apply to different proportions of the grazing platform.

## Practice generator

After completing the fixed farm case, students can generate new well-drained practice cases.

The generator varies:

- grazing-platform area;
- measured slurry inventory;
- lime-block area;
- SMP pH.

Students then calculate:

- 40%, 15% and 30% grazing areas;
- weighted average N by 1 April;
- total N across the grazing platform;
- early-spring slurry requirement;
- slurry remaining;
- lime rate;
- total lime tonnage.

The practice generator uses the same 2025 well-drained-farm spring-N rules and the same lime formula as the fixed teaching case.

Practice attempts are included in the score table.

## Scoring

Each lesson provides live feedback while students type.

Students press **Mark this attempt** to add an attempt to the score table. The app records:

- attempts;
- successful attempts;
- unsuccessful attempts;
- best mark;
- completion status.

Marks are stored locally in the browser and can be downloaded as CSV or submitted by screenshot.

## Important limitation

This is a teaching case, not a complete statutory nutrient-management plan.

A real farm plan must also consider:

- current soil-test results;
- current manure analysis / dry matter;
- actual grass demand;
- weather and trafficability;
- nutrient allowances and stocking-rate rules;
- closed periods and water-protection rules;
- current Irish regulations.

Always verify current Teagasc guidance and regulations before applying nutrients on farm.

## Publish

Upload `index.html`, `styles.css`, `app.js`, and `README.md` to a GitHub repository and enable GitHub Pages.
