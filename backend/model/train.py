import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
import joblib

# Load data
df = pd.read_csv('data/Student Depression Dataset.csv')

# Drop unnecessary columns
df = df.drop(columns=['id', 'City', 'Degree', 'CGPA', 'Job Satisfaction'])

# Drop rows with missing values
df = df.dropna()

print(f"Using {len(df)} rows after cleaning")

# Encode categorical columns
le = LabelEncoder()

df['Gender'] = le.fit_transform(df['Gender'])  # Male=1, Female=0
df['Dietary Habits'] = df['Dietary Habits'].map({
    'Unhealthy': 0, 'Moderate': 1, 'Healthy': 2
}).fillna(1)
df['Sleep Duration'] = df['Sleep Duration'].map({
    'Less than 5 hours': 0,
    '5-6 hours': 1,
    '7-8 hours': 2,
    'More than 8 hours': 3
}).fillna(1)
df['Family History of Mental Illness'] = df['Family History of Mental Illness'].map({
    'No': 0, 'Yes': 1
})
df['Have you ever had suicidal thoughts ?'] = df['Have you ever had suicidal thoughts ?'].map({
    'No': 0, 'Yes': 1
})
df['Profession'] = le.fit_transform(df['Profession'].astype(str))

print("Columns after encoding:")
print(df.columns.tolist())
print(df.head())

# Features and target
feature_cols = [col for col in df.columns if col != 'Depression']
X = df[feature_cols]
y = df['Depression']

print(f"\nFeatures: {feature_cols}")
print(f"Target distribution:\n{y.value_counts()}")

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Handle class imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

print(f"\nAfter SMOTE: {X_train_res.shape}")

# Train XGBoost model
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='logloss',
)

model.fit(X_train_res, y_train_res)

# Evaluate
y_pred = model.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred,
    target_names=['No Depression', 'Depression']))

# Save model and feature names
joblib.dump(model, 'model/model.pkl')
joblib.dump(feature_cols, 'model/feature_cols.pkl')

print("\nModel saved successfully!")
print(f"Features used: {feature_cols}")