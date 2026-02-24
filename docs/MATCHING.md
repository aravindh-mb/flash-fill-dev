# 🤖 Intelligent Field Matching Dictionary

Flash Fill uses a high-intelligence matching engine to detect what kind of data your form fields need. It scans attributes like `name`, `id`, `placeholder`, and `<label>` text.

## 📋 Categorized Matching Patterns

Below is a list of the 100+ field types supported out of the box.

### 👤 Identity & Names
| Category | Keywords | Data Source |
| :--- | :--- | :--- |
| **First Name** | `firstname`, `fname`, `given`, `forename`, `nombre`, `vorname` | `faker.person.firstName()` |
| **Last Name** | `lastname`, `lname`, `surname`, `family`, `apellido`, `nachname` | `faker.person.lastName()` |
| **Username** | `username`, `handle`, `login`, `nickname`, `gamertag`, `alias` | `faker.internet.username()` |
| **Basics** | `age`, `gender`, `prefix`, `suffix`, `marital_status`, `religion` | Specialized Logic |

### 📞 Contact & Digital
| Category | Keywords | Data Source |
| :--- | :--- | :--- |
| **Email** | `email`, `mail`, `e-mail`, `email_address`, `emailid` | `faker.internet.email()` |
| **Phone** | `phone`, `mobile`, `tel`, `whatsapp`, `cell`, `contact_no` | `faker.phone.number()` |
| **URLs** | `website`, `portfolio`, `blog`, `site`, `link`, `domain` | `faker.internet.url()` |
| **Social** | `linkedin`, `github`, `twitter`, `instagram`, `youtube`, `discord` | Smart Prefixing |

### 🏦 Banking & Finance (India Optimized)
| Category | Keywords | Format Example |
| :--- | :--- | :--- |
| **IFSC Code** | `ifsc`, `bank_code`, `neft_code`, `rtgs_code` | `SBIN0123456` |
| **MICR Code** | `micr`, `micr_code`, `micr_num` | `123456789` |
| **PAN Card** | `pan`, `pannumber`, `income_tax_id` | `ABCDE1234F` |
| **GST Number**| `gst`, `gstin`, `goods_services_tax` | `27ABCDE1234F1Z5` |
| **Accounts** | `accountnumber`, `acc_no`, `bank_account`, `iban` | `faker.finance.accountNumber()` |
| **Cards** | `cardnumber`, `cvv`, `expiry`, `cc_num`, `cardholder` | `faker.finance.creditCard()` |

### 📍 Address & Geography
| Category | Keywords | Data Source |
| :--- | :--- | :--- |
| **Street** | `street`, `address1`, `line1`, `house`, `st_addr` | `faker.location.streetAddress()` |
| **City** | `city`, `town`, `locality`, `suburb`, `hometown` | `faker.location.city()` |
| **State** | `state`, `province`, `region`, `zone`, `county` | `faker.location.state()` |
| **ZIP/PIN** | `zip`, `postal`, `pincode`, `pin_code`, `postcode` | `faker.location.zipCode()` |
| **GPS** | `lat`, `long`, `coords`, `timezone` | `faker.location.latitude()` |

### 💼 Professional & Education
| Category | Keywords | Data Source |
| :--- | :--- | :--- |
| **Company** | `company`, `organization`, `employer`, `brand`, `firm` | `faker.company.name()` |
| **Job Title** | `jobtitle`, `designation`, `role`, `position` | `faker.person.jobTitle()` |
| **Education**| `school`, `college`, `university`, `degree`, `gpa` | Custom University Logic |
| **Skills** | `skills`, `skillset`, `expertise`, `technologies` | Software Stack List |

---

## ⚡ How Detection Priority Works
The engine looks at the field in this order:
1.  **Type Check**: If `type="email"`, it immediately assigns email logic.
2.  **Explicit Name**: The `name` attribute in your HTML.
3.  **Visual ID**: The `id` attribute.
4.  **User Sight**: The `placeholder` or the text of a `<label>` pointing to the field.

## 🛠 Manual Overrides
If you want to force specific data for a field, you can use a **Profile** when initializing:

```javascript
init_flash_fill({
  profile: {
    'custom_field_name': 'My Hardcoded Value'
  }
});
```
