import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# =====================================================
# CONFIGURATION
# =====================================================
NUM_SAMPLES = 2000
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# IMPORTANT: must match classifier class indices
ISSUE_MAP = {
    0: "garbage",
    1: "normal",
    2: "pothole",
    3: "waterlogging"
}

# =====================================================
# STEP 1: GENERATE SYNTHETIC DATA
# =====================================================
data = []

for _ in range(NUM_SAMPLES):
    issue_type = np.random.choice([0, 1, 2, 3], p=[0.25, 0.35, 0.25, 0.15])
    confidence = np.round(np.random.uniform(0.6, 1.0), 2)
    hour = np.random.randint(0, 24)
    location_freq = np.random.randint(0, 20)
    desc_length = np.random.randint(5, 120)

    # Base severity
    if issue_type == 1:          # normal
        severity = 1
    elif issue_type == 0:        # garbage
        severity = 3
    elif issue_type == 2:        # pothole
        severity = 4
    else:                        # waterlogging
        severity = 5

    # Modifiers
    if confidence > 0.9:
        severity += 1
    if location_freq > 10:
        severity += 1
    if hour >= 22 or hour <= 5:
        severity += 1

    severity = min(severity, 5)

    data.append([
        issue_type,
        confidence,
        hour,
        location_freq,
        desc_length,
        severity
    ])

df = pd.DataFrame(
    data,
    columns=[
        "issue_type",
        "confidence",
        "hour",
        "location_freq",
        "desc_length",
        "severity"
    ]
)

# =====================================================
# STEP 2: TRAIN / TEST SPLIT
# =====================================================
X = df.drop("severity", axis=1)
y = df["severity"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
)

# =====================================================
# STEP 3: TRAIN RANDOM FOREST MODEL
# =====================================================
severity_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=RANDOM_SEED,
    class_weight="balanced"
)

severity_model.fit(X_train, y_train)

# =====================================================
# STEP 4: EVALUATION
# =====================================================
y_pred = severity_model.predict(X_test)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="magma")
plt.title("Severity Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# =====================================================
# STEP 5: BUSINESS LOGIC (CORRECT PLACE)
# =====================================================
def severity_to_priority(severity):
    if severity <= 2:
        return "Low"
    elif severity == 3:
        return "Medium"
    elif severity == 4:
        return "High"
    else:
        return "Emergency"

# =====================================================
# STEP 6: TEST PREDICTION (IMPORTANT)
# =====================================================
sample_input = np.array([[2, 0.93, 22, 14, 56]])  # pothole example
pred_severity = severity_model.predict(sample_input)[0]
priority = severity_to_priority(pred_severity)

print("\nSample Prediction:")
print("Severity:", pred_severity)
print("Priority:", priority)

# =====================================================
# STEP 7: SAVE MODEL
# =====================================================
joblib.dump(severity_model, "severity_predictor.pkl")
print("\nSeverity model saved as severity_predictor.pkl")
