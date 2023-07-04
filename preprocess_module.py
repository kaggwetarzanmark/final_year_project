import sys
import pandas as pd
import mysql.connector
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import pickle
from datetime import datetime, timedelta


def preprocess_data(data):
    # Convert 'Date' column to datetime
    data['Date'] = pd.to_datetime(data['Date'])

    # Group data by week and month, and calculate the total sales
    data_weekly = data.groupby(pd.Grouper(key='Date', freq='W')).sum().reset_index()
    data_monthly = data.groupby(pd.Grouper(key='Date', freq='M')).sum().reset_index()

    # Handling missing values
    imputer = SimpleImputer(strategy='mean')
    data_weekly['Promotion'].fillna(data_weekly['Promotion'].mode()[0], inplace=True)
    data_monthly['Promotion'].fillna(data_monthly['Promotion'].mode()[0], inplace=True)
    data_weekly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']] = imputer.fit_transform(data_weekly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']])
    data_monthly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']] = imputer.fit_transform(data_monthly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']])

    # Replace 'Yes' and 'No' values with default values before converting to int
    default_promotion = 0
    promotion_mapping = {'Yes': 1, 'No': 0}
    data_weekly['Promotion'] = data_weekly['Promotion'].map(promotion_mapping).fillna(default_promotion).astype(int)
    data_monthly['Promotion'] = data_monthly['Promotion'].map(promotion_mapping).fillna(default_promotion).astype(int)

    # Feature scaling
    scaler = StandardScaler()
    data_weekly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']] = scaler.fit_transform(data_weekly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']])
    data_monthly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']] = scaler.fit_transform(data_monthly[['Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost']])

    return {'weekly': data_weekly.drop(columns=['Date', 'Quantity']),
            'monthly': data_monthly.drop(columns=['Date', 'Quantity'])}


# MySQL connection details
connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='supermarket'
)

# Retrieve the product name from command line arguments
product_name = sys.argv[1]

# Query to fetch data from the salesorder and product tables with the dynamically passed product name
query = f"""
    SELECT so.Date, p.Price, so.Temperature, so.CompetitorPrice, so.CompetitorCount, so.AdvertisingCost, so.Promotion, so.Quantity
    FROM salesorder AS so
    JOIN product AS p ON so.product_id = p.product_id
    WHERE p.product_name = '{product_name}'
"""

# Create a cursor and execute the query
cursor = connection.cursor()
cursor.execute(query)

# Fetch the data and store it in a DataFrame
data = pd.DataFrame(cursor.fetchall(),
                    columns=['Date', 'Price', 'Temperature', 'CompetitorPrice', 'CompetitorCount', 'AdvertisingCost', 'Promotion', 'Quantity'])
print(data)
# Preprocess the data
preprocessed_data = preprocess_data(data)

# Load the trained models from the pickle files
with open('./models/linear_regression_model.pkl', 'rb') as file:
    linear_regression_model = pickle.load(file)

with open('./models/linear_regression_model2.pkl', 'rb') as file:
    linear_regression_model2 = pickle.load(file)

# Make predictions using the loaded models and the preprocessed data
weekly_prediction_linear = linear_regression_model.predict(preprocessed_data['weekly'])
monthly_prediction_linear = linear_regression_model2.predict(preprocessed_data['monthly'])


# Get the maximum week and month values from the selected data
max_week = data['Date'].dt.isocalendar().week.max()
max_month = data['Date'].dt.month.max()


# Get the current year
current_year = data['Date'].dt.year.max()

# Check if the maximum week or month exceeds the maximum values of the current year
if max_week > pd.Timestamp(year=current_year, month=12, day=31).week:
    next_year = current_year + 1
else:
    next_year = current_year

 #Generate the date ranges for the weekly and monthly predictions using the next year
date_range_weekly = pd.date_range(start=f'{next_year + 1}-01-01', periods=len(weekly_prediction_linear), freq='W-SUN')
date_range_monthly = pd.date_range(start=f'{next_year + 1}-01-01', periods=len(monthly_prediction_linear), freq='MS')

# Assign dates to the predicted values dataframes
predicted_df_weekly = pd.DataFrame({'Date': date_range_weekly, 'Prediction': weekly_prediction_linear})
predicted_df_monthly = pd.DataFrame({'Date': date_range_monthly, 'Prediction': monthly_prediction_linear})

# Convert the 'Date' column to a formatted string
predicted_df_weekly['Date'] = predicted_df_weekly['Date'].dt.strftime('%Y-%m-%d')
predicted_df_monthly['Date'] = predicted_df_monthly['Date'].dt.strftime('%Y-%m-%d')


# Print the predictions
print("Linear Regression Weekly Prediction:\n", predicted_df_weekly)
print("Linear Regression Monthly Prediction:\n", predicted_df_monthly)

# Close the cursor and connection
cursor.close()
connection.close()
