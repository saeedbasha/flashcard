# Topic to repo notebook map

Which local repo (and which notebook files inside it) each quiz topic's 3 repo questions are grounded in.
Repos live in the gitignored `repos/` folder (a local clone set, not committed).

This file exists because the mapping is easy to get wrong from memory: during the 9-book-plus-3-repo
restructure and a later audit, a reconstructed-from-memory map pointed several topics at the wrong repo
(for example Topic 2 was checked against `ds-linear-regression` when its repo questions actually come from
`ds-hands-on-ml`). Always ground repo questions and grounding checks against the paths listed here, and
revalidate that every path exists before trusting them.

## Notebook topics (26)

Each of these keeps 12 questions: 9 book questions plus 3 repo questions (2 easy + 1 medium; the single hard stays a book question).

| Topic | Name | Repo | Notebook(s) grounding the repo questions |
|------:|------|------|------------------------------------------|
| 2 | 2. Data Science & ML Fundamentals | `ds-hands-on-ml` | `1_scaling_hyperparameter_tuning.ipynb`<br>`2_exercise_machine_learning.ipynb` |
| 4 | 4. Data Visualization Design | `ds-visualisation` | `2_Plotting_intro.ipynb`<br>`5_Fantastic_charts.ipynb` |
| 5 | 5. Exploratory Data Analysis & Visualization | `ds-eda-project-template` | `03_fetching_the_data_eda.ipynb`<br>`04_eda.ipynb` |
| 6 | 6. Linear Regression & Gradient Descent | `ds-linear-regression` | `1_simple_linear_regression_sklearn.ipynb`<br>`2_limitations_of_linear_regression.ipynb` |
| 7 | 7. Bias-Variance Tradeoff & Regularization | `ds-predictive-regression` | `1_bias_variance_tradeoff.ipynb`<br>`2_regularization.ipynb` |
| 8 | 8. Logistic Regression & Evaluation Metrics | `ds-logistic-regression` | `1_logistic_regression.ipynb`<br>`2_logistic_regression_sklearn.ipynb` |
| 9 | 9. K-Nearest Neighbors & Distance Metrics | `ds-distance-metrics-knn` | `1_distance_metric_python.ipynb`<br>`2_distance_metric_exercise.ipynb` |
| 10 | 10. Decision Trees & Ensemble Methods | `ds-decision-tree` | `1_decision_trees_visualization.ipynb`<br>`2_decision_trees_classification.ipynb` |
| 11 | 11. Feature Engineering | `ds-data-cleaning` | `01_data_cleaning.ipynb` |
| 12 | 12. ML Productionization & Data Products | `ds-ml-project-template` | `03_eda-and-modeling.ipynb` |
| 13 | 13. Neural Networks & Deep Learning | `ds-artificial-neural-networks` | `day_1/01_regression_tensorflow_keras.ipynb`<br>`day_1/02_classification_tensorflow_keras.ipynb` |
| 14 | 14. Image Modeling & Convolutional Neural Networks (CNNs) | `ds-image_classification_mini_project` | `02_starter_notebook.ipynb` |
| 15 | 15. NLP Fundamentals | `ds-intro-to-NLP` | `1_spam_classifier.ipynb`<br>`2_spam_zero_shot.ipynb` |
| 16 | 16. AI Agents & RAG Systems | `ds-rag-pipeline` | `notebooks/RAG-Pipeline-Llama.ipynb`<br>`notebooks/RAG_Exercise_Notebook.ipynb` |
| 18 | 18. Hypothesis Testing | `ds-hypothesis-testing` | `1_hypo_test_guide.ipynb`<br>`2_hypo_testing_exercise.ipynb` |
| 19 | 19. Time Series Analysis | `ds-time-series` | `01_Intro_EDA_Time_Series.ipynb`<br>`02_Time_Series_Stock_Price.ipynb` |
| 20 | 20. Dimensionality Reduction | `ds-dimensionality-reduction` | `1_Principal_Component_Analysis.ipynb`<br>`2_t_SNE.ipynb` |
| 21 | 21. Clustering & Unsupervised Learning | `ds-clustering` | `1_Comparing_Clustering_Algorithms.ipynb`<br>`2_Clustering_for_Customer_Segmentation.ipynb` |
| 22 | 22. LLM Foundations & Embeddings | `ds-prompt-engineering` | `2_intro_langchain.ipynb`<br>`3_langchain_prompt_engineering.ipynb` |
| 23 | 23. Code Refactoring and OOP | `mle-refactoring-and-oop` | `01-refactoring-variables.ipynb`<br>`02-refactoring-functions.ipynb` |
| 24 | 24. Testing, Packaging, and Decorators in Python | `mle-unit-integration-testing` | `01-intro-to-python-packaging/01-intro-to-python-packaging.ipynb`<br>`02-intro-to-unit-testing/02-intro-to-unit-testing.ipynb` |
| 25 | 25. Docker and APIs | `mle-api-docker` | `01-intro-to-json.ipynb` |
| 26 | 26. Data Modeling and ETL Pipelines | `mle-data-pipeline-and-modeling` | `02-load-data.ipynb`<br>`03-data-modeling.ipynb` |
| 29 | 29. ML Engineering Fundamentals | `mle-basics-of-ml` | `02-ML-model-sklearn.ipynb`<br>`03-evaluation-metrics-for-classification.ipynb` |
| 30 | 30. Testing ML Systems | `mle-testing-for-ml` | `01-eda-and-model-training.ipynb`<br>`02-behavioral-testing.ipynb` |
| 34 | 34. Model Performance Monitoring and Drift | `mle-monitoring-in-ml` | `01-train-ml-model.ipynb`<br>`02-intro-to-drift.ipynb` |

## Book-only topics (8)

No linked repo; all 12 questions are book questions (sourced from the course book, see the `add-quiz-topic` skill).

- 1. 1. Git & Version Control Workflows
- 3. 3. Databases & SQL Fundamentals
- 17. 17. Probability Distributions & Confidence Intervals
- 27. 27. dbt (Data Build Tool)
- 28. 28. Workflow Orchestration with Prefect
- 31. 31. Model Deployment Strategies
- 32. 32. CI/CD for ML Systems
- 33. 33. Service Monitoring

## Revalidate before use

```bash
# from the repo root, checks every path in this map still exists on disk
# (adjust the here-doc map if repos are added or renamed)
ls repos/ds-hands-on-ml/1_scaling_hyperparameter_tuning.ipynb   # example spot check
```
