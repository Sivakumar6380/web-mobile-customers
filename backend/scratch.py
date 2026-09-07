import pandas as pd
df = pd.read_excel('C:/projects/Web mobile customer/query_regression_detector_dataset.xlsx')
print(df.info())
print("=========================")
print(df.head(2).to_string())
