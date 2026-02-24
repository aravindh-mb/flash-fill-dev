import { faker } from '@faker-js/faker';
import type { DetectedField } from './dom_scanner';

export interface AutofillConfig {
    profile?: Record<string, any>;
    use_faker?: boolean;
    locale?: string;
}

const DEFAULT_DATA: Record<string, string> = {
    name: 'Aravindh Arumugam',
    email: 'test@gmail.com',
    phone: '9876543210',
};

export function fill_fields(fields: DetectedField[], config: AutofillConfig = { use_faker: true }) {
    // Group radio buttons by name — pick one per group
    const radio_groups = new Set<string>();

    fields.forEach(field => {
        if (field.type === 'radio') {
            if (radio_groups.has(field.key)) return; // skip duplicates
            radio_groups.add(field.key);
            fill_radio_group(field.key);
            return;
        }

        const value = resolve_value(field.key, field.type, field.tag, config);
        set_element_value(field.element, value, field.type);
    });
}

function resolve_value(
    key: string,
    type: string,
    tag: string,
    config: AutofillConfig
): string {
    const k = key.toLowerCase();

    // Explicit profile override
    if (config.profile) {
        for (const profile_key of Object.keys(config.profile)) {
            if (k.includes(profile_key.toLowerCase())) {
                return String(config.profile[profile_key]);
            }
        }
    }

    // Checkbox: just mark true
    if (type === 'checkbox') return 'true';

    // Range: return midpoint
    if (type === 'range') return '50';

    // Date types
    if (type === 'date') return faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0]!;
    if (type === 'month') return `${faker.date.recent().getFullYear()}-${String(faker.date.recent().getMonth() + 1).padStart(2, '0')}`;
    if (type === 'week') return `${faker.date.recent().getFullYear()}-W${String(faker.date.recent().getMonth() + 1).padStart(2, '0')}`;
    if (type === 'time') return `${String(faker.number.int({ min: 0, max: 23 })).padStart(2, '0')}:${String(faker.number.int({ min: 0, max: 59 })).padStart(2, '0')}`;
    if (type === 'datetime-local') {
        const d = faker.date.recent();
        return d.toISOString().slice(0, 16);
    }

    // Number
    if (type === 'number') {
        if (matches(k, ['age'])) return String(faker.number.int({ min: 18, max: 80 }));
        if (matches(k, ['year'])) return String(faker.number.int({ min: 1960, max: 2005 }));
        if (matches(k, ['salary', 'income', 'ctc'])) return String(faker.number.int({ min: 30000, max: 200000 }));
        if (matches(k, ['qty', 'quantity', 'count'])) return String(faker.number.int({ min: 1, max: 10 }));
        if (matches(k, ['zip', 'postal', 'pin'])) return faker.location.zipCode();
        return String(faker.number.int({ min: 1, max: 100 }));
    }

    // URL
    if (type === 'url' || matches(k, ['url', 'website', 'portfolio', 'linkedin', 'github', 'twitter'])) {
        if (matches(k, ['linkedin'])) return `https://linkedin.com/in/${faker.internet.username()}`;
        if (matches(k, ['github'])) return `https://github.com/${faker.internet.username()}`;
        if (matches(k, ['twitter'])) return `https://twitter.com/${faker.internet.username()}`;
        return faker.internet.url();
    }

    // Color
    if (type === 'color') return faker.color.rgb({ format: 'hex' }) as string;

    // Textarea — generate a paragraph
    if (tag === 'textarea') {
        if (matches(k, ['bio', 'about', 'description', 'summary'])) return faker.lorem.paragraph(2);
        if (matches(k, ['address', 'addr'])) return faker.location.streetAddress(true);
        if (matches(k, ['message', 'comment', 'feedback', 'note', 'reason'])) return faker.lorem.sentences(3);
        if (matches(k, ['experience', 'work'])) return faker.lorem.paragraph(1);
        if (matches(k, ['skill'])) return 'JavaScript, TypeScript, React, Node.js, Python';
        return faker.lorem.paragraph();
    }

    // Email
    if (type === 'email' || matches(k, ['email', 'mail', 'e-mail'])) return faker.internet.email();

    // Phone / Tel
    if (type === 'tel' || matches(k, ['phone', 'mobile', 'cell', 'contact', 'tel', 'fax'])) {
        return faker.phone.number({ style: 'national' });
    }

    // Password
    if (type === 'password' || matches(k, ['password', 'passwd', 'pass', 'pwd', 'secret'])) {
        if (matches(k, ['confirm', 'repeat', 'verify', 'retype'])) return 'TestPass@123';
        return 'TestPass@123';
    }

    // Name fields
    if (matches(k, ['firstname', 'first_name', 'fname', 'given'])) return faker.person.firstName();
    if (matches(k, ['lastname', 'last_name', 'lname', 'surname', 'family'])) return faker.person.lastName();
    if (matches(k, ['middlename', 'middle_name', 'mname'])) return faker.person.middleName();
    if (matches(k, ['fullname', 'full_name', 'name'])) return faker.person.fullName();
    if (matches(k, ['username', 'user_name', 'handle', 'login', 'userid'])) return faker.internet.username();
    if (matches(k, ['prefix', 'title', 'salutation'])) return faker.person.prefix();

    // Address fields
    if (matches(k, ['street', 'address1', 'addr1', 'line1'])) return faker.location.streetAddress();
    if (matches(k, ['address2', 'addr2', 'line2', 'apt', 'suite', 'unit'])) return `Apt ${faker.number.int({ min: 1, max: 999 })}`;
    if (matches(k, ['address', 'addr'])) return faker.location.streetAddress(true);
    if (matches(k, ['city', 'town', 'locality'])) return faker.location.city();
    if (matches(k, ['state', 'province', 'region'])) return faker.location.state();
    if (matches(k, ['zip', 'postal', 'postcode', 'pincode', 'pin'])) return faker.location.zipCode();
    if (matches(k, ['country'])) return faker.location.country();
    if (matches(k, ['countrycode', 'country_code'])) return faker.location.countryCode();
    if (matches(k, ['landmark', 'near'])) return `Near ${faker.company.name()}`;

    // Professional
    if (matches(k, ['company', 'organization', 'org', 'employer', 'firm'])) return faker.company.name();
    if (matches(k, ['department', 'dept'])) return faker.commerce.department();
    if (matches(k, ['jobtitle', 'job_title', 'position', 'designation', 'role'])) return faker.person.jobTitle();
    if (matches(k, ['industry', 'sector'])) return faker.person.jobArea();
    if (matches(k, ['salary', 'income', 'ctc', 'wage'])) return String(faker.number.int({ min: 40000, max: 200000 }));
    if (matches(k, ['experience', 'exp', 'years'])) return String(faker.number.int({ min: 1, max: 20 }));
    if (matches(k, ['empid', 'employee_id', 'staffid'])) return `EMP${faker.number.int({ min: 1000, max: 9999 })}`;

    // Financial
    if (matches(k, ['cardnumber', 'card_number', 'creditcard', 'cc_number', 'ccnumber'])) {
        return faker.finance.creditCardNumber({ issuer: 'visa' });
    }
    if (matches(k, ['cvv', 'cvc', 'card_code', 'security_code'])) return faker.finance.creditCardCVV();
    if (matches(k, ['cardexpiry', 'card_expiry', 'expiry', 'expdate', 'exp_date'])) {
        const m = faker.number.int({ min: 1, max: 12 });
        const y = faker.number.int({ min: 25, max: 30 });
        return `${String(m).padStart(2, '0')}/${y}`;
    }
    if (matches(k, ['routing', 'routingnumber'])) return faker.finance.routingNumber();
    if (matches(k, ['accountnumber', 'account_number', 'bankaccount'])) return faker.finance.accountNumber(12);
    if (matches(k, ['ifsc', 'swift', 'bic'])) return faker.finance.bic();
    if (matches(k, ['amount', 'price', 'cost', 'fee', 'budget'])) return faker.commerce.price({ min: 100, max: 10000 });
    if (matches(k, ['iban'])) return faker.finance.iban();
    if (matches(k, ['currency'])) return faker.finance.currencyCode();

    // Identity
    if (matches(k, ['ssn', 'socialsecurity'])) return faker.string.numeric(9);
    if (matches(k, ['passport'])) return `P${faker.string.alphanumeric(7).toUpperCase()}`;
    if (matches(k, ['dob', 'birthdate', 'birthday', 'date_of_birth'])) {
        return faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0]!;
    }
    if (matches(k, ['age'])) return String(faker.number.int({ min: 18, max: 65 }));

    // Digital
    if (matches(k, ['ip', 'ipaddress', 'ip_address'])) return faker.internet.ip();
    if (matches(k, ['mac', 'macaddress'])) return faker.internet.mac();
    if (matches(k, ['uuid', 'guid'])) return faker.string.uuid();

    // Education
    if (matches(k, ['school', 'college', 'university', 'institution'])) return faker.company.name() + ' University';
    if (matches(k, ['degree', 'qualification'])) return 'Bachelor of Technology';
    if (matches(k, ['major', 'specialization', 'field'])) return 'Computer Science';
    if (matches(k, ['gpa', 'cgpa', 'grade'])) return (faker.number.float({ min: 6, max: 10, fractionDigits: 1 })).toFixed(1);

    // Generic text type fallback
    if (type === 'search') return faker.commerce.productName();
    if (type === 'text') {
        // Last resort key heuristics
        if (k.length > 0 && k !== 'unknown') return faker.lorem.words(2);
    }

    return faker.lorem.word();
}

function fill_radio_group(name: string) {
    const radios = Array.from(
        document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${name}"]`)
    );
    if (!radios.length) return;
    // Pick one randomly
    const pick = radios[Math.floor(Math.random() * radios.length)];
    if (pick) {
        pick.checked = true;
        pick.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function matches(key: string, keywords: string[]): boolean {
    return keywords.some(k => key.includes(k));
}

function set_element_value(
    el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    value: string,
    type: string
) {
    const tag = el.tagName.toLowerCase();

    if (type === 'checkbox') {
        (el as HTMLInputElement).checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }

    if (type === 'range') {
        const input = el as HTMLInputElement;
        const min = Number(input.min) || 0;
        const max = Number(input.max) || 100;
        input.value = String(Math.floor((min + max) / 2));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }

    if (tag === 'select') {
        const select = el as HTMLSelectElement;
        const options = Array.from(select.options).filter(o => o.value !== '');
        // Try to match by value or text
        const match = options.find(o =>
            o.value.toLowerCase() === value.toLowerCase() ||
            o.text.toLowerCase() === value.toLowerCase()
        );
        if (match) {
            select.value = match.value;
        } else if (options.length > 0) {
            // Pick a random valid option
            const random = options[Math.floor(Math.random() * options.length)];
            if (random) select.value = random.value;
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }

    // Default text-like inputs
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    // React synthetic event support
    try {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeInputValueSetter && tag === 'input') {
            nativeInputValueSetter.call(el, value);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch { }
}
