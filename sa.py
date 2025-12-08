from fpdf import FPDF
from datetime import datetime

# Your items data
items = [
    {"title": "Fresh Paneer (Malai), 1 Kg", "price": 325, "stock": 0},
    {"title": "Eagle - Shahi Paneer Masala, 100 gm", "price": 51, "stock": 2047},
    {"title": "Eagle - Pav Bhaji Masala, 100 gm", "price": 38, "stock": 98},
    {"title": "Coriander Leaves/Dhaniya, 1 Kg", "price": 65, "stock": 361},
    {"title": "Green Chilli, 1 Kg", "price": 97, "stock": 133},
    {"title": "Tata - Salt, 1 Kg", "price": 29, "stock": 2421},
    {"title": "Shudh Garhwal - Fresh Malai Paneer (Vacuum Pack), 1 Kg", "price": 337, "stock": 7},
    {"title": "Button Mushroom, 200 gm", "price": 190, "stock": 916},
    {"title": "Lemon, 470 - 530 gm", "price": 86, "stock": 226},
    {"title": "MDH - Deggi Mirch, 100 gm", "price": 76, "stock": 5953},
    {"title": "MDH - Coriander / Dhaniya Powder, 500 gm", "price": 152, "stock": 603},
    {"title": "MDH - Black Pepper Powder, 100 gm", "price": 131, "stock": 47},
    {"title": "Sugar, 10 Kg", "price": 518, "stock": 179},
    {"title": "Surya - Dry Khopra, 1 Kg", "price": 355, "stock": 121},
    {"title": "Orange Carrot, 2 Kg", "price": 67.5, "stock": 92},
    {"title": "Catch - Turmeric Powder, 1 Kg", "price": 283, "stock": 26},
    {"title": "Green Capsicum (Big Size), 1 Kg", "price": 107, "stock": 665},
]

# Create PDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", "B", 16)
pdf.cell(0, 10, "Invoice - Purchase Items", ln=True, align="C")

pdf.set_font("Arial", "", 12)
pdf.cell(0, 10, f"Date: {datetime.now().strftime('%d-%m-%Y %H:%M')}", ln=True)
pdf.ln(5)

# Table headers
pdf.set_font("Arial", "B", 12)
pdf.cell(90, 10, "Item", 1)
pdf.cell(30, 10, "Price (₹)", 1)
pdf.cell(30, 10, "Stock", 1)
pdf.ln()

# Table content
pdf.set_font("Arial", "", 12)
for item in items:
    pdf.cell(90, 10, item['title'], 1)
    pdf.cell(30, 10, f"{item['price']}", 1, 0, 'R')
    pdf.cell(30, 10, f"{item['stock']}", 1, 0, 'R')
    pdf.ln()

# Save PDF
pdf.output("purchase_invoice.pdf")
print("PDF generated successfully!")
