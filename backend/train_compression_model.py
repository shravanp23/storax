"""
Train a ML model for file compression prediction.
Run this once to generate the model file.
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error
import joblib
import os

# Training data based on real compression research and file format characteristics
# Features: [size_mb, is_image, is_pdf, is_text, is_video, is_archive, is_office, extension_encoded]
# Labels: [savings_percent, should_compress (0/1)]

training_data = [
    # JPEG images - high compression
    [0.1, 1, 0, 0, 0, 0, 0, 1, 45, 1],
    [0.5, 1, 0, 0, 0, 0, 0, 1, 55, 1],
    [1.0, 1, 0, 0, 0, 0, 0, 1, 60, 1],
    [2.0, 1, 0, 0, 0, 0, 0, 1, 65, 1],
    [5.0, 1, 0, 0, 0, 0, 0, 1, 68, 1],
    [10.0, 1, 0, 0, 0, 0, 0, 1, 70, 1],
    [14.0, 1, 0, 0, 0, 0, 0, 1, 72, 1],
    [20.0, 1, 0, 0, 0, 0, 0, 1, 70, 1],
    # PNG images - medium compression
    [0.05, 1, 0, 0, 0, 0, 0, 2, 15, 0],
    [0.1, 1, 0, 0, 0, 0, 0, 2, 20, 0],
    [0.3, 1, 0, 0, 0, 0, 0, 2, 30, 1],
    [0.5, 1, 0, 0, 0, 0, 0, 2, 40, 1],
    [1.0, 1, 0, 0, 0, 0, 0, 2, 48, 1],
    [2.0, 1, 0, 0, 0, 0, 0, 2, 52, 1],
    [5.0, 1, 0, 0, 0, 0, 0, 2, 55, 1],
    # WebP - already optimized
    [0.1, 1, 0, 0, 0, 0, 0, 3, 5, 0],
    [0.5, 1, 0, 0, 0, 0, 0, 3, 5, 0],
    [1.0, 1, 0, 0, 0, 0, 0, 3, 3, 0],
    # BMP - high compression potential
    [0.5, 1, 0, 0, 0, 0, 0, 4, 60, 1],
    [1.0, 1, 0, 0, 0, 0, 0, 4, 65, 1],
    [2.0, 1, 0, 0, 0, 0, 0, 4, 68, 1],
    # PDF files
    [0.1, 0, 1, 0, 0, 0, 0, 5, 10, 0],
    [0.5, 0, 1, 0, 0, 0, 0, 5, 20, 0],
    [1.0, 0, 1, 0, 0, 0, 0, 5, 30, 1],
    [2.0, 0, 1, 0, 0, 0, 0, 5, 38, 1],
    [5.0, 0, 1, 0, 0, 0, 0, 5, 50, 1],
    [10.0, 0, 1, 0, 0, 0, 0, 5, 55, 1],
    [20.0, 0, 1, 0, 0, 0, 0, 5, 58, 1],
    # Text files - very high compression
    [0.001, 0, 0, 1, 0, 0, 0, 6, 5, 0],
    [0.01, 0, 0, 1, 0, 0, 0, 6, 30, 0],
    [0.1, 0, 0, 1, 0, 0, 0, 6, 70, 1],
    [0.5, 0, 0, 1, 0, 0, 0, 6, 75, 1],
    [1.0, 0, 0, 1, 0, 0, 0, 6, 80, 1],
    [5.0, 0, 0, 1, 0, 0, 0, 6, 82, 1],
    # CSV files
    [0.05, 0, 0, 1, 0, 0, 0, 7, 60, 1],
    [0.5, 0, 0, 1, 0, 0, 0, 7, 72, 1],
    [1.0, 0, 0, 1, 0, 0, 0, 7, 78, 1],
    # Video files
    [5.0, 0, 0, 0, 1, 0, 0, 8, 10, 0],
    [10.0, 0, 0, 0, 1, 0, 0, 8, 15, 0],
    [50.0, 0, 0, 0, 1, 0, 0, 8, 35, 1],
    [100.0, 0, 0, 0, 1, 0, 0, 8, 40, 1],
    [200.0, 0, 0, 0, 1, 0, 0, 8, 42, 1],
    # Archive files - already compressed
    [0.5, 0, 0, 0, 0, 1, 0, 9, 2, 0],
    [1.0, 0, 0, 0, 0, 1, 0, 9, 1, 0],
    [10.0, 0, 0, 0, 0, 1, 0, 9, 2, 0],
    [50.0, 0, 0, 0, 0, 1, 0, 9, 3, 0],
    # Office documents
    [0.1, 0, 0, 0, 0, 0, 1, 10, 10, 0],
    [0.5, 0, 0, 0, 0, 0, 1, 10, 15, 0],
    [1.0, 0, 0, 0, 0, 0, 1, 10, 20, 0],
    [2.0, 0, 0, 0, 0, 0, 1, 10, 28, 1],
    [5.0, 0, 0, 0, 0, 0, 1, 10, 32, 1],
    # GIF files
    [0.1, 1, 0, 0, 0, 0, 0, 11, 40, 1],
    [0.5, 1, 0, 0, 0, 0, 0, 11, 50, 1],
    [1.0, 1, 0, 0, 0, 0, 0, 11, 55, 1],
    # TIFF files
    [1.0, 1, 0, 0, 0, 0, 0, 12, 60, 1],
    [5.0, 1, 0, 0, 0, 0, 0, 12, 65, 1],
    [10.0, 1, 0, 0, 0, 0, 0, 12, 68, 1],
    # JSON files
    [0.01, 0, 0, 1, 0, 0, 0, 13, 65, 1],
    [0.1, 0, 0, 1, 0, 0, 0, 13, 72, 1],
    [1.0, 0, 0, 1, 0, 0, 0, 13, 78, 1],
    # XML files
    [0.05, 0, 0, 1, 0, 0, 0, 14, 70, 1],
    [0.5, 0, 0, 1, 0, 0, 0, 14, 76, 1],
    [2.0, 0, 0, 1, 0, 0, 0, 14, 80, 1],
]

data = np.array(training_data)
X = data[:, :8]  # Features
y_savings = data[:, 8]  # Savings percent
y_compress = data[:, 9]  # Should compress

# Add noise for better generalization
np.random.seed(42)
noise = np.random.normal(0, 2, y_savings.shape)
y_savings_noisy = np.clip(y_savings + noise, 0, 95)

# Train savings regression model
savings_model = Pipeline([
    ('scaler', StandardScaler()),
    ('model', GradientBoostingClassifier(n_estimators=100, random_state=42))
])

# Train binary classification model
compress_model = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestRegressor(n_estimators=100, random_state=42))
])

X_train, X_test, ys_train, ys_test = train_test_split(X, y_savings_noisy, test_size=0.2, random_state=42)
X_train2, X_test2, yc_train, yc_test = train_test_split(X, y_compress, test_size=0.2, random_state=42)

compress_model.fit(X_train, ys_train)
savings_model.fit(X_train2, yc_train)

# Evaluate
ys_pred = compress_model.predict(X_test)
yc_pred = savings_model.predict(X_test2)
yc_pred_binary = (yc_pred > 0.5).astype(int)

print(f"Savings MAE: {mean_absolute_error(ys_test, ys_pred):.2f}%")
print(f"Compress Accuracy: {accuracy_score(yc_test, yc_pred_binary):.2%}")

# Save models
os.makedirs('models', exist_ok=True)
joblib.dump(compress_model, 'models/savings_model.pkl')
joblib.dump(savings_model, 'models/compress_model.pkl')
print("✅ Models saved to models/ directory!")

# Test predictions
test_cases = [
    ([14.0, 1, 0, 0, 0, 0, 0, 1], "14MB JPEG"),
    ([5.0, 0, 1, 0, 0, 0, 0, 5], "5MB PDF"),
    ([1.0, 0, 0, 1, 0, 0, 0, 6], "1MB Text"),
    ([0.05, 0, 0, 0, 0, 1, 0, 9], "50KB ZIP"),
    ([50.0, 0, 0, 0, 1, 0, 0, 8], "50MB Video"),
]

print("\nTest Predictions:")
for features, name in test_cases:
    features_arr = np.array(features).reshape(1, -1)
    savings = compress_model.predict(features_arr)[0]
    should = savings_model.predict(features_arr)[0]
    print(f"  {name}: savings={savings:.1f}%, compress={'YES' if should > 0.5 else 'NO'}")