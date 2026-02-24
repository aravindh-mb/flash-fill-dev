# 🌏 Global Standards & Advanced Intelligence

Flash Fill is designed for international development. It recognizes and generates data based on global financial, identity, and professional standards.

## 🏦 International Banking

### IBAN (International Bank Account Number)
Matches `iban`, `iban_number`. Generates validly structured IBANs for international transactions.

### SWIFT / BIC
Matches `swift`, `bic`, `bank_id`. Generates valid bank identifier codes.

### Routing & Transit
Matches `routing`, `aba`, `transit_number`. Essential for US and Canadian banking integrations.

---

## 🆔 Global Identity & Tax

### Passport Numbers
Matches `passport`, `passport_number`, `passport_no`. Generates realistic alphanumeric passport identifiers.

### Tax Identifiers
Matches `tax_id`, `taxid`, `vat_number`, `ein`, `tin`. 
- **Global:** Generates VAT/TIN structures.
- **US:** Matches `ssn`, `social_security`.
- **India:** Matches `pan`, `gstin`.

### National IDs
Matches `national_id`, `ssn`, `aadhar`, `resident_id`. The engine intelligently picks a format based on the keyword context.

---

## 🏗️ Technical & Digital Standards

### UUID / GUID
Matches `uuid`, `guid`, `correlation_id`. Generates RFC-compliant UUIDs.

### IP & Networking
Matches `ip_address`, `ipv4`, `ipv6`, `mac_address`. Generates valid networking identifiers for infrastructure testing.

### Vehicle VIN
Matches `vin`, `chassis_number`, `vehicle_id`. Generates 17-character Vehicle Identification Numbers.

---

## 📦 Logistics & E-Commerce

### SKU & Barcodes
Matches `sku`, `ean`, `upc`, `barcode`. Generates product identifiers used in global retail.

### Tracking Numbers
Matches `tracking_number`, `shipment_id`. Generates identifiers similar to FedEx, DHL, and UPS formats.

---

## 🛡️ Authentication & Security
Matches `api_key`, `auth_token`, `secret_key`, `jwt`. Generates secure-looking stubs for testing authorization flows.

---

## Summary of Global Intelligence

| Category | Standard Matchers | Data Format |
| :--- | :--- | :--- |
| **Finance** | IBAN, SWIFT, Routing | Bank-standard sequences |
| **Tax** | VAT, TIN, SSN, PAN, EIN | Region-specific masks |
| **Logistics** | SKU, EAN, VIN, Tracking | Uppercase alphanumeric |
| **Digital** | UUID, IPv6, MAC, JWT | Compliant stubs |
