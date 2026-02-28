# 🌊 Onda Intelligence  
## Drone-to-Decision Pipeline for Plastic Odyssey

Onda Intelligence is a lightweight decision-support system that transforms drone imagery into actionable cleanup planning insights for Plastic Odyssey.

Rather than presenting raw object detections or abstract counts, Onda translates aerial plastic detections into operational metrics that mission planners can use directly:

- Shoreline density heatmaps  
- Estimated plastic mass (kg / tonnes)  
- Cleanup labor projections (person-hours)  
- Vessel capacity planning estimates  
- Uncertainty-aware operational ranges  

This project was developed for the Ocean Tech Hackathon 2026 – Plastic Odyssey Challenge.

---

## 🧭 The Operational Problem

Plastic Odyssey conducts cleanup missions on remote coastal and UNESCO-listed islands. Accurately estimating plastic accumulation prior to deployment is critical for logistics planning.

Current assessment methods rely on:

- Manual transect sampling  
- Sparse extrapolation across heterogeneous coastlines  
- Highly uncertain total mass estimates  

Real-world missions such as Aldabra Atoll (Seychelles) and Saint Brandon (Mauritius) demonstrate how estimation errors can materially impact operations, leading to:

- Under-resourced cleanup missions  
- Vessel storage overflow  
- Incomplete shoreline coverage  
- Inefficient allocation of expedition time  

Drone imagery improves visibility, but it only captures surface-level plastic. A significant portion of waste remains buried or trapped in vegetation.

The core challenge is not simply detecting plastic.  
It is translating partial aerial observations into realistic operational decisions under uncertainty.

---

## 🎯 What Onda Intelligence Solves

Onda provides a proof-of-concept pipeline that:

- Ingests tiled drone imagery  
- Detects surface plastic objects  
- Converts pixel detections into mass estimates  
- Aggregates density spatially by shoreline segment  
- Produces decision-ready outputs for mission planners  

The system is designed for non-technical expedition planners who need clear, interpretable outputs rather than raw model predictions.

---

## 🔍 Key Assumptions (Explicitly Modeled)

- Drone imagery captures surface plastic only  
- A meaningful proportion of plastic is buried or hidden  
- Surface detections represent an undercount  
- Weight estimation is based on provided working assumptions:
  - Surface density: **0.48 g/cm²**
  - Ground resolution: **0.5 cm/pixel**

All outputs are presented as estimated ranges rather than single deterministic values to reflect inherent uncertainty.

---

## 🧠 System Architecture

### 1. Detection Layer
- Trained on labeled drone imagery (Zones 1–4)  
- Treats all detected objects as a single plastic class  
- Outputs bounding boxes or pixel masks  

### 2. Spatial Aggregation
- Converts pixel area to cm²  
- Converts cm² to grams using surface density  
- Aggregates results by shoreline segment  
- Generates spatial density heatmaps  

### 3. Operational Translation Layer
Converts estimated mass into:

- Estimated person-hours  
- Estimated days of cleanup  
- Vessel capacity requirements  
- Shoreline prioritization rankings  

### 4. Visualization Layer
Web-based dashboard displaying:

- Plastic density heatmap  
- Shoreline segmentation  
- Mass estimate ranges (minimum, expected, conservative)  
- Cleanup time projections  
- Mission resource requirements  

---

## 🖥️ What Works Today

- Functional ingestion of tiled drone imagery  
- Surface plastic detection prototype  
- Pixel-to-weight conversion pipeline  
- Shoreline density aggregation  
- Mass estimation using provided formula  
- Uncertainty-aware mass range display  
- Interactive dashboard featuring:
  - Density heatmap by shoreline segment  
  - Total estimated tonnage  
  - Person-hour estimation  
  - Vessel capacity planning estimates  
  - Shoreline prioritization visualization  
- Clear, non-technical interface suitable for expedition planners  

The current dataset is sufficient to demonstrate feasibility and end-to-end workflow integration within the scope of the hackathon.

---

## ⚠️ What Is Incomplete

- The detection model is not fully refined due to limited labeled data (<1,000 annotated objects)  
- Buried plastic estimation is currently heuristic-based  
- No real-time retraining loop  
- No cross-expedition transfer validation  
- Final evaluation on Zone 5 remains limited to hackathon constraints  

Despite these limitations, the pipeline functions end-to-end and produces actionable planning outputs within the available data constraints.

---

## 🚀 What We Would Build Next

- A calibrated buried-plastic estimation model using surface-to-total correction factors derived from field logs  
- Confidence scoring based on shoreline heterogeneity (cliffs, slope, vegetation density)  
- Bayesian uncertainty modeling for improved mission planning ranges  
- Integration with ocean current data to predict accumulation zones  
- Expedition simulation tools for vessel and team-size scenario planning  
- Continuous model refinement using real cleanup operation logs  

---

## 📊 Decisions This Supports

Onda Intelligence enables Plastic Odyssey planners to answer:

- Where are plastic accumulation hotspots along the shoreline?  
- How many tonnes should be realistically expected?  
- How many person-hours are required?  
- Which vessel has sufficient transport capacity?  
- Which shoreline segments should be prioritized first?  

---

Onda Intelligence demonstrates how drone imagery can move beyond visualization and become a practical operational planning tool for large-scale coastal cleanup missions.
