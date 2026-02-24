import { faker } from '@faker-js/faker';
import type { DetectedField } from './dom_scanner';

export interface AutofillConfig {
    profile?: Record<string, any>;
    use_faker?: boolean;
    locale?: string;
}

// Input types that must never be filled
const SKIP_TYPES = new Set(['submit', 'reset', 'button', 'image', 'file']);

export function fill_fields(fields: DetectedField[], config: AutofillConfig = { use_faker: true }) {
    // Group radio buttons by name — pick one per group
    const radio_groups = new Set<string>();

    fields.forEach(field => {
        // Skip non-fillable input types
        if (SKIP_TYPES.has(field.type)) return;

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

    // 1. Explicit profile override (Highest Priority)
    if (config.profile) {
        for (const [profile_key, value] of Object.entries(config.profile)) {
            if (matches(k, [profile_key.toLowerCase()])) return String(value);
        }
    }

    // 2. High-Level Type Overrides
    if (type === 'checkbox') return 'true';
    if (type === 'range') return '50';
    if (type === 'color') return faker.color.rgb({ format: 'hex' });
    if (type === 'datetime-local') {
        const dt = faker.date.recent();
        return dt.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    }
    if (type === 'week') {
        const d = faker.date.recent();
        const week = Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    if (type === 'search') return faker.lorem.words(2);
    if (type === 'date' || matches(k, [
        'dob', 'birth', 'birthday', 'date_of_birth', 'dateofbirth', 'birthdate',
        'birth_date', 'bday', 'born', 'born_on', 'date_born', 'birth_day',
        'birth_year', 'birthyear', 'year_of_birth', 'yearofbirth', 'dob_date',
        'dateofbirth', 'dobfield', 'birth_dt', 'bdate', 'dob_field',
    ])) {
        return faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0]!;
    }
    if (type === 'month') return `${faker.date.recent().getFullYear()}-${String(faker.date.recent().getMonth() + 1).padStart(2, '0')}`;
    if (type === 'time') return `${String(faker.number.int({ min: 0, max: 23 })).padStart(2, '0')}:${String(faker.number.int({ min: 0, max: 59 })).padStart(2, '0')}`;

    // 3. Names & Identity
    if (matches(k, [
        'firstname', 'first_name', 'fname', 'given', 'forename',
        'givenname', 'given_name', 'first', 'f_name', 'firstnm',
        'first_nm', 'fn', 'prenom', 'nombre', 'vorname', 'nome',
        'christian_name', 'baptismal_name', 'legal_first', 'legal_firstname',
        'contact_first', 'billing_first', 'shipping_first', 'user_first',
        'account_first', 'member_first', 'customer_first', 'buyer_first',
        'applicant_first', 'employee_first', 'student_first', 'patient_first',
        'guardian_first', 'parent_first', 'emergency_first', 'spouse_first',
        'first_name_field', 'fname_input', 'given_nm', 'firstname_input',
    ])) return faker.person.firstName();

    if (matches(k, [
        'lastname', 'last_name', 'lname', 'surname', 'family',
        'familyname', 'family_name', 'last', 'l_name', 'lastnm',
        'last_nm', 'ln', 'apellido', 'nachname', 'cognome',
        'legal_last', 'legal_lastname', 'contact_last', 'billing_last',
        'shipping_last', 'user_last', 'account_last', 'member_last',
        'customer_last', 'buyer_last', 'applicant_last', 'employee_last',
        'student_last', 'patient_last', 'guardian_last', 'parent_last',
        'emergency_last', 'spouse_last', 'last_name_field', 'lname_input',
        'family_nm', 'lastname_input', 'sir_name', 'sirname',
    ])) return faker.person.lastName();

    if (matches(k, [
        'middlename', 'middle_name', 'mname', 'middleinitial', 'middle_initial',
        'middle', 'mid_name', 'second_name', 'secondname', 'middle_nm',
        'mnm', 'mi', 'paternal', 'maternal', 'middle_name_field',
    ])) return faker.person.middleName();

    if (matches(k, [
        'fullname', 'full_name', 'name', 'customer_name', 'display_name',
        'wholename', 'whole_name', 'complete_name', 'completename',
        'legal_name', 'legalname', 'full_legal_name', 'your_name',
        'yourname', 'person_name', 'personname', 'member_name', 'membername',
        'account_name', 'accountname', 'profile_name', 'profilename',
        'contact_name', 'contactname', 'billing_name', 'billingname',
        'shipping_name', 'shippingname', 'recipient_name', 'recipientname',
        'payee_name', 'payeename', 'cardholder', 'card_holder',
        'card_holder_name', 'cardholdername', 'name_on_card', 'nameoncard',
        'depositor_name', 'beneficiary_name', 'applicant_name', 'owner_name',
        'full_nm', 'nombre_completo', 'nom_complet', 'vollständiger_name',
        'nome_completo', 'patient_name', 'student_name', 'employee_name',
        'user_name_full', 'author_name', 'respondent_name',
    ])) return faker.person.fullName();

    if (matches(k, [
        'username', 'user_name', 'handle', 'login', 'userid', 'nickname',
        'uname', 'u_name', 'user_id', 'screen_name', 'screenname',
        'alias', 'user_handle', 'userhandle', 'account_id', 'accountid',
        'login_name', 'loginname', 'login_id', 'loginid', 'sign_in_name',
        'signin_name', 'member_id', 'memberid', 'profile_id', 'profileid',
        'player_name', 'playername', 'gamer_tag', 'gamertag', 'gamer_id',
        'discord_name', 'steam_name', 'psn_id', 'xbox_tag', 'battletag',
        'preferred_username', 'nick', 'online_name', 'forum_name',
        'chat_name', 'display_id', 'public_name', 'public_id',
    ])) return faker.internet.username();

    if (matches(k, [
        'prefix', 'title', 'salutation', 'honorific', 'name_prefix',
        'name_title', 'greeting', 'name_greeting', 'mr_ms', 'mr_mrs',
        'courtesy_title', 'name_salutation', 'honorific_prefix',
        'personal_title', 'form_of_address', 'gender_title',
    ])) return faker.person.prefix();

    if (matches(k, [
        'suffix', 'name_suffix', 'generational_suffix', 'generation',
        'jr', 'sr', 'ii', 'iii', 'phd', 'md', 'esq',
    ])) return faker.person.suffix();

    if (matches(k, [
        'gender', 'sex', 'gender_identity', 'gender_type', 'biological_sex',
        'sex_at_birth', 'legal_gender', 'pronoun', 'pronouns', 'pronoun_preference',
    ])) return faker.helpers.arrayElement(['Male', 'Female', 'Non-binary', 'Prefer not to say']);

    if (matches(k, [
        'age', 'years_old', 'current_age', 'age_years', 'person_age',
        'user_age', 'applicant_age', 'patient_age',
    ])) return faker.number.int({ min: 18, max: 75 }).toString();

    if (matches(k, [
        'nationality', 'citizenship', 'national_id', 'ssn', 'social_security',
        'social_security_number', 'nin', 'nino', 'national_insurance',
        'passport_number', 'passport_no', 'passport_num', 'aadhar',
        'aadhar_number', 'aadharcard', 'voter_id', 'voterid', 'voter_card',
        'driving_license', 'drivinglicense', 'dl_number', 'license_number',
        'drivers_license', 'driver_license', 'dl_no', 'dl_num',
    ])) return faker.string.alphanumeric(10).toUpperCase();

    if (matches(k, [
        'ethnicity', 'race', 'ethnic_group', 'ethnic_origin',
    ])) return faker.helpers.arrayElement(['Asian', 'Black or African American', 'Hispanic or Latino', 'White', 'Two or More Races', 'Prefer not to say']);

    if (matches(k, [
        'marital_status', 'marital', 'civil_status', 'relationship_status',
        'married', 'single', 'divorced', 'widowed',
    ])) return faker.helpers.arrayElement(['Single', 'Married', 'Divorced', 'Widowed', 'Separated']);

    if (matches(k, [
        'religion', 'faith', 'belief', 'denomination',
    ])) return faker.helpers.arrayElement(['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Other', 'Prefer not to say']);

    if (matches(k, [
        'blood_group', 'bloodgroup', 'blood_type', 'bloodtype',
    ])) return faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);

    if (matches(k, [
        'height', 'weight_height', 'stature', 'person_height',
    ])) return `${faker.number.int({ min: 150, max: 200 })} cm`;

    // 4. Contact & Digital
    if (type === 'email' || matches(k, [
        'email', 'mail', 'e-mail', 'email_address', 'emailaddress',
        'email_addr', 'emailaddr', 'e_mail', 'electronic_mail',
        'contact_email', 'work_email', 'personal_email', 'primary_email',
        'secondary_email', 'alternate_email', 'alt_email', 'user_email',
        'account_email', 'member_email', 'customer_email', 'billing_email',
        'shipping_email', 'support_email', 'notification_email',
        'recovery_email', 'backup_email', 'login_email', 'register_email',
        'signup_email', 'office_email', 'corporate_email', 'business_email',
        'school_email', 'edu_email', 'edu_mail', 'email_id', 'emailid',
        'email_input', 'email_field', 'email_box', 'your_email',
        'preferred_email', 'new_email', 'old_email', 'confirm_email',
        'repeat_email', 'verify_email', 'email_confirmation', 'email_confirm',
        'addr', 'email_address_field', 'mail_address',
    ])) return faker.internet.email();

    if (type === 'tel' || matches(k, [
        'phone', 'mobile', 'cell', 'contact', 'tel', 'fax', 'dial',
        'telephone', 'phone_number', 'phonenumber', 'phone_num', 'phonenum',
        'mobile_number', 'mobilenumber', 'mobile_num', 'mobilenum',
        'cell_number', 'cellnumber', 'cell_num', 'cellnum',
        'contact_number', 'contactnumber', 'contact_no', 'contactno',
        'home_phone', 'homephone', 'work_phone', 'workphone',
        'office_phone', 'officephone', 'business_phone', 'businessphone',
        'primary_phone', 'secondary_phone', 'alternate_phone', 'alt_phone',
        'emergency_phone', 'whatsapp', 'whatsapp_number', 'viber',
        'sms', 'sms_number', 'text_number', 'textnumber',
        'landline', 'land_line', 'extension', 'ext', 'phone_ext',
        'phone_extension', 'direct_line', 'direct_dial', 'pager',
        'toll_free', 'tollfree', 'phone_field', 'tel_field', 'phone_input',
        'phone_no', 'phoneno', 'mob', 'mob_no', 'mobno', 'mob_num',
        'mobile_field', 'cell_field', 'tel_input', 'phone1', 'phone2',
        'phone3', 'mobile1', 'mobile2', 'contact_phone', 'contactphone',
    ])) return faker.phone.number({ style: 'national' });

    if (type === 'url' || matches(k, [
        'url', 'website', 'portfolio', 'link', 'site', 'domain',
        'web', 'webpage', 'web_page', 'web_address', 'webaddress',
        'homepage', 'home_page', 'personal_site', 'personalsite',
        'personal_website', 'personalwebsite', 'blog', 'blog_url',
        'portfolio_url', 'portfoliourl', 'online_profile', 'onlineprofile',
        'profile_url', 'profileurl', 'social_link', 'sociallink',
        'external_link', 'externallink', 'ref_url', 'refurl',
        'company_website', 'companywebsite', 'business_url', 'businessurl',
        'company_url', 'companyurl', 'org_website', 'orgwebsite',
        'school_website', 'schoolwebsite', 'university_website', 'resource_url',
        'callback_url', 'redirect_url', 'return_url', 'source_url',
        'image_url', 'avatar_url', 'photo_url', 'thumbnail_url',
        'cover_url', 'banner_url', 'media_url', 'video_url', 'doc_url',
        'file_url', 'download_url', 'stream_url', 'embed_url',
    ])) {
        if (matches(k, ['linkedin'])) return `https://linkedin.com/in/${faker.internet.username()}`;
        if (matches(k, ['github', 'git_hub', 'git'])) return `https://github.com/${faker.internet.username()}`;
        if (matches(k, ['twitter', 'x_dot_com', 'tweet'])) return `https://x.com/${faker.internet.username()}`;
        if (matches(k, ['facebook', 'fb'])) return `https://facebook.com/${faker.internet.username()}`;
        if (matches(k, ['instagram', 'insta', 'ig'])) return `https://instagram.com/${faker.internet.username()}`;
        if (matches(k, ['youtube', 'yt'])) return `https://youtube.com/@${faker.internet.username()}`;
        if (matches(k, ['tiktok', 'tik_tok'])) return `https://tiktok.com/@${faker.internet.username()}`;
        if (matches(k, ['behance'])) return `https://behance.net/${faker.internet.username()}`;
        if (matches(k, ['dribbble', 'dribble'])) return `https://dribbble.com/${faker.internet.username()}`;
        if (matches(k, ['medium'])) return `https://medium.com/@${faker.internet.username()}`;
        if (matches(k, ['substack'])) return `https://substack.com/@${faker.internet.username()}`;
        if (matches(k, ['stackoverflow', 'stack_overflow'])) return `https://stackoverflow.com/users/${faker.number.int({ min: 100000, max: 9999999 })}`;
        if (matches(k, ['discord'])) return `https://discord.com/users/${faker.string.numeric(18)}`;
        if (matches(k, ['twitch'])) return `https://twitch.tv/${faker.internet.username()}`;
        if (matches(k, ['reddit'])) return `https://reddit.com/u/${faker.internet.username()}`;
        if (matches(k, ['pinterest'])) return `https://pinterest.com/${faker.internet.username()}`;
        if (matches(k, ['snapchat', 'snap'])) return `https://snapchat.com/add/${faker.internet.username()}`;
        return faker.internet.url();
    }

    // 5. Authentication
    if (type === 'password' || matches(k, [
        'password', 'passwd', 'pass', 'pwd', 'secret', 'pin_code',
        'passphrase', 'pass_phrase', 'access_code', 'accesscode',
        'secret_key', 'secretkey', 'api_key', 'apikey', 'api_secret',
        'apisecret', 'auth_token', 'authtoken', 'token', 'auth_key',
        'authkey', 'private_key', 'privatekey', 'security_key', 'securitykey',
        'login_password', 'loginpassword', 'account_password', 'accountpassword',
        'current_password', 'currentpassword', 'new_password', 'newpassword',
        'old_password', 'oldpassword', 'confirm_password', 'confirmpassword',
        'repeat_password', 'repeatpassword', 'verify_password', 'verifypassword',
        'retype_password', 'retypepassword', 'password_confirm', 'passwordconfirm',
        'pin', 'mpin', 'atm_pin', 'bank_pin', 'otp', 'one_time_password',
        'totp', 'hotp', 'verification_code', 'verificationcode', 'security_code',
        'securitycode', 'access_token', 'bearer_token', 'user_secret',
        'user_password', 'master_password', 'masterpassword',
    ])) return 'TestPass@123';

    if (matches(k, [
        'security_question', 'securityquestion', 'secret_question', 'secretquestion',
    ])) return 'What was the name of your first pet?';

    if (matches(k, [
        'security_answer', 'securityanswer', 'secret_answer', 'secretanswer',
    ])) return 'Fluffy';

    // 6. Address & Geography
    if (matches(k, [
        'street', 'address1', 'addr1', 'line1', 'house', 'st_addr',
        'street_address', 'streetaddress', 'address_line1', 'addressline1',
        'addr_line1', 'addrline1', 'house_number', 'housenumber',
        'house_no', 'houseno', 'building_number', 'buildingnumber',
        'plot_number', 'plotnumber', 'plot_no', 'plotno',
        'door_number', 'doornumber', 'door_no', 'doorno',
        'flat_number', 'flatnumber', 'flat_no', 'flatno',
        'street_line', 'streetline', 'mailing_street', 'primary_street',
        'home_street', 'work_street', 'office_street', 'billing_street',
        'shipping_street', 'delivery_street', 'correspondence_street',
        'permanent_address', 'current_address', 'present_address',
        'residential_address', 'resaddress', 'postal_address',
        'street_number', 'streetnumber', 'street_no', 'streetno',
    ])) return faker.location.streetAddress();

    if (matches(k, [
        'address2', 'addr2', 'line2', 'apt', 'suite', 'unit', 'flat', 'building',
        'address_line2', 'addressline2', 'addr_line2', 'addrline2',
        'apartment', 'apartment_number', 'apartmentnumber',
        'apt_number', 'aptnumber', 'apt_no', 'aptno', 'apt_num',
        'suite_number', 'suitenumber', 'suite_no', 'suiteno',
        'unit_number', 'unitnumber', 'unit_no', 'unitno',
        'floor', 'floor_number', 'floornumber', 'floor_no', 'floorno',
        'room', 'room_number', 'roomnumber', 'room_no', 'roomno',
        'building_name', 'buildingname', 'block', 'block_number',
        'blocknumber', 'block_no', 'blockno', 'sector', 'tower',
        'wing', 'phase', 'pocket', 'colony', 'extension',
        'secondary_address', 'secondary_addr', 'addr_detail', 'address_detail',
        'additional_address', 'additionaladdress', 'extra_address',
    ])) return `Apt ${faker.number.int({ min: 1, max: 999 })}`;

    if (matches(k, [
        'address', 'addr', 'location', 'full_address', 'fulladdress',
        'complete_address', 'completeaddress', 'mailing_address', 'mailingaddress',
        'billing_address', 'billingaddress', 'shipping_address', 'shippingaddress',
        'delivery_address', 'deliveryaddress', 'home_address', 'homeaddress',
        'work_address', 'workaddress', 'office_address', 'officeaddress',
        'current_addr', 'permanent_addr', 'residential_addr',
        'business_address', 'businessaddress', 'company_address', 'companyaddress',
        'correspondence_address', 'registered_address', 'registeredaddress',
        'contact_address', 'contactaddress', 'primary_address', 'primaryaddress',
        'secondary_address_full', 'alt_address', 'alternate_address',
        'warehouse_address', 'pickup_address', 'return_address',
        'physical_address', 'physicaladdress', 'legal_address', 'legaladdress',
    ])) return faker.location.streetAddress(true);

    if (matches(k, [
        'city', 'town', 'locality', 'suburb', 'city_name', 'cityname',
        'town_name', 'townname', 'village', 'municipality', 'metro',
        'metropolis', 'district', 'district_name', 'districtname',
        'billing_city', 'billingcity', 'shipping_city', 'shippingcity',
        'delivery_city', 'deliverycity', 'home_city', 'homecity',
        'work_city', 'workcity', 'office_city', 'officecity',
        'mailing_city', 'mailingcity', 'primary_city', 'current_city',
        'birth_city', 'birthcity', 'city_of_birth', 'hometown',
        'home_town', 'origin_city', 'destination_city', 'nearest_city',
        'preferred_city', 'residential_city', 'permanent_city',
    ])) return faker.location.city();

    if (matches(k, [
        'state', 'province', 'region', 'zone', 'county',
        'state_name', 'statename', 'province_name', 'provincename',
        'region_name', 'regionname', 'territory', 'prefecture',
        'billing_state', 'billingstate', 'shipping_state', 'shippingstate',
        'delivery_state', 'deliverystate', 'home_state', 'homestate',
        'work_state', 'workstate', 'office_state', 'officestate',
        'mailing_state', 'mailingstate', 'primary_state', 'current_state',
        'birth_state', 'birthstate', 'state_of_birth', 'origin_state',
        'residential_state', 'permanent_state', 'correspondence_state',
        'state_province', 'stateprovince', 'state_region',
        'administrative_area', 'admin_area', 'area', 'division',
    ])) return faker.location.state();

    if (matches(k, [
        'zip', 'postal', 'postcode', 'pincode', 'pin_code',
        'zipcode', 'zip_code', 'postal_code', 'postalcode',
        'post_code', 'post_zip', 'zip_postal', 'area_code',
        'billing_zip', 'billingzip', 'shipping_zip', 'shippingzip',
        'delivery_zip', 'deliveryzip', 'home_zip', 'homezip',
        'work_zip', 'workzip', 'office_zip', 'officezip',
        'mailing_zip', 'mailingzip', 'primary_zip', 'current_zip',
        'origin_zip', 'destination_zip', 'from_zip', 'to_zip',
        'billing_postal', 'shipping_postal', 'billing_postcode', 'shipping_postcode',
        'zip_code_field', 'postal_field', 'pin_field', 'pincode_field',
        'zipfield', 'postalfield', 'zip5', 'zip4', 'zip_ext',
    ])) return faker.location.zipCode();

    if (matches(k, [
        'country', 'nation', 'country_name', 'countryname',
        'nationality', 'citizenship', 'country_of_origin', 'origin_country',
        'home_country', 'birth_country', 'country_of_birth',
        'billing_country', 'billingcountry', 'shipping_country', 'shippingcountry',
        'delivery_country', 'deliverycountry', 'mailing_country', 'mailingcountry',
        'passport_country', 'issuing_country', 'tax_country',
        'residence_country', 'current_country', 'permanent_country',
        'secondary_country', 'alt_country', 'destination_country',
        'from_country', 'to_country', 'operating_country',
    ])) return faker.location.country();

    if (matches(k, [
        'country_code', 'countrycode', 'country_iso', 'iso_code',
        'iso_country', 'nation_code', 'nationcode', 'alpha2', 'alpha3',
        'calling_code', 'callingcode', 'phone_code', 'phonecode',
        'isd_code', 'isdcode', 'dialing_code', 'dialingcode',
    ])) return faker.location.countryCode();

    if (matches(k, [
        'landmark', 'near', 'direction', 'area_landmark', 'nearby',
        'nearest_landmark', 'area_near', 'near_landmark',
    ])) return `Near ${faker.company.name()}`;

    if (matches(k, [
        'lat', 'latitude', 'geo_lat', 'gps_lat', 'location_lat',
        'coords_lat', 'coord_lat', 'position_lat', 'y_coord',
    ])) return faker.location.latitude().toString();

    if (matches(k, [
        'long', 'longitude', 'lng', 'geo_long', 'geo_lng', 'gps_long',
        'gps_lng', 'location_long', 'location_lng', 'coords_long', 'coords_lng',
        'coord_long', 'coord_lng', 'position_long', 'position_lng', 'x_coord',
    ])) return faker.location.longitude().toString();

    if (matches(k, [
        'timezone', 'time_zone', 'tz', 'utc_offset', 'local_timezone',
    ])) return faker.location.timeZone();

    if (matches(k, [
        'building', 'building_name', 'buildingname', 'complex', 'campus',
        'society', 'colony', 'locality_name', 'area_name', 'neighborhood',
        'neighbourhood', 'nagar', 'enclave', 'estate',
    ])) return `${faker.company.name()} Complex`;

    // 7. Financial & Banking
    if (matches(k, [
        'cardnumber', 'card_number', 'creditcard', 'cc_num',
        'credit_card_number', 'creditcardnumber', 'debit_card_number',
        'debitcardnumber', 'card_no', 'cardno', 'card_num', 'cardnum',
        'cc_number', 'ccnumber', 'cc_no', 'ccno', 'visa', 'mastercard',
        'amex', 'discover', 'card_field', 'cardfield', 'payment_card',
        'paymentcard', 'pan_number', 'account_card', 'card_account',
        'card_id', 'cardid', 'card_code', 'cardcode',
    ])) return faker.finance.creditCardNumber();

    if (matches(k, [
        'cvv', 'cvc', 'security_code', 'securitycode', 'cvv2', 'cvc2',
        'csv', 'card_verification', 'cvn', 'card_security_code',
        'cardsecuritycode', 'card_validation_code', 'cid', 'ccv',
        'verification_number', 'card_pin', 'card_verification_value',
    ])) return faker.finance.creditCardCVV();

    if (matches(k, [
        'expiry', 'exp_date', 'valid_thru', 'expiry_date', 'expirydate',
        'expiration', 'expiration_date', 'expirationdate', 'exp_month',
        'exp_year', 'card_expiry', 'cardexpiry', 'card_expiration',
        'cardexpiration', 'card_exp', 'cardexp', 'valid_through',
        'valid_until', 'valid_till', 'expire', 'expires', 'expiry_field',
        'mm_yy', 'mmyy', 'mm_yyyy', 'mmyyyy', 'card_valid',
    ])) return '12/28';

    if (matches(k, [
        'ifsc', 'swift', 'bic', 'bank_code', 'ifsc_code', 'ifsccode',
        'swift_code', 'swiftcode', 'bic_code', 'biccode', 'bank_id',
        'bank_identifier', 'sort_code', 'sortcode', 'clearing_code',
        'clearingcode', 'bank_branch_code', 'branch_code', 'branchcode',
        'neft_code', 'rtgs_code', 'imps_code', 'bank_ifsc', 'branch_ifsc',
        'ifsc_num', 'ifsc_no', 'ifsc_field',
    ])) return 'SBIN0' + faker.string.numeric(6);

    if (matches(k, [
        'micr', 'micr_code', 'micrcode', 'magnetic_ink', 'micr_number',
        'micr_no', 'micr_num', 'micr_field', 'micr_digit', 'bank_micr',
        'branch_micr', 'micr_code_field', 'micr_input',
    ])) return faker.string.numeric(9);

    if (matches(k, [
        'accountnumber', 'acc_no', 'bank_acc', 'account_number', 'accountno',
        'account_no', 'acc_num', 'bank_account', 'bankaccount',
        'bank_account_number', 'bankaccountnumber', 'savings_account',
        'checking_account', 'current_account', 'acc_number', 'accnumber',
        'account_num', 'account_id', 'accountid', 'bank_no', 'bankno',
        'debit_account', 'credit_account', 'payment_account',
        'deposit_account', 'withdrawal_account', 'linked_account',
    ])) return faker.finance.accountNumber(12);

    if (matches(k, [
        'routing', 'aba', 'transit', 'routing_number', 'routingnumber',
        'aba_number', 'abanumber', 'routing_no', 'routingno',
        'bank_routing', 'bankrouting', 'ach_routing', 'achrouting',
        'wire_routing', 'wirerouting',
    ])) return faker.finance.routingNumber();

    if (matches(k, [
        'iban', 'iban_number', 'ibannumber', 'international_bank_account',
    ])) return faker.finance.iban();

    if (matches(k, [
        'pan', 'pannumber', 'income_tax_id', 'pan_number', 'pan_no',
        'pan_card', 'pancard', 'tax_id', 'taxid', 'tin',
        'tax_identification', 'tax_identification_number', 'taxpayer_id',
        'taxpayerid', 'vat_number', 'vatnumber', 'vat_id', 'vatid',
        'ein', 'employer_id', 'employerid', 'employer_identification',
    ])) return (faker.string.alpha(5) + faker.string.numeric(4) + faker.string.alpha(1)).toUpperCase();

    if (matches(k, [
        'gst', 'gstin', 'gst_number', 'gstnumber', 'gst_no', 'gstno',
        'gstin_number', 'gstinnumber', 'goods_services_tax',
        'service_tax_no', 'sgst', 'cgst', 'igst',
    ])) return '27' + faker.string.alpha(5) + faker.string.numeric(4) + faker.string.alpha(1) + '1Z5';

    if (matches(k, [
        'amount', 'price', 'cost', 'fee', 'budget', 'salary', 'income',
        'wage', 'total', 'subtotal', 'grand_total', 'grandtotal',
        'total_amount', 'totalamount', 'payment_amount', 'paymentamount',
        'invoice_amount', 'invoiceamount', 'bill_amount', 'billamount',
        'due_amount', 'dueamount', 'outstanding', 'balance', 'balance_due',
        'loan_amount', 'loanamount', 'principal', 'interest', 'emi',
        'installment', 'installment_amount', 'monthly_payment',
        'annual_salary', 'monthly_salary', 'basic_salary', 'gross_salary',
        'net_salary', 'ctc', 'compensation', 'pay', 'payroll',
        'remuneration', 'earnings', 'revenue', 'profit', 'loss',
        'expenditure', 'expense', 'expenses', 'spend', 'spending',
        'charge', 'charges', 'rate', 'tariff', 'premium', 'deposit',
        'down_payment', 'downpayment', 'advance', 'refund', 'cashback',
        'discount_amount', 'offer_price', 'selling_price', 'mrp',
        'base_price', 'unit_price', 'list_price', 'retail_price',
        'wholesale_price', 'market_price', 'valuation', 'value',
        'net_worth', 'asset_value', 'investment_amount', 'fund_amount',
    ])) return faker.commerce.price({ min: 1000, max: 100000 });

    if (matches(k, [
        'currency', 'money', 'currency_code', 'currencycode',
        'currency_type', 'currencytype', 'payment_currency',
        'transaction_currency', 'base_currency', 'local_currency',
        'foreign_currency', 'preferred_currency',
    ])) return faker.finance.currencyCode();

    if (matches(k, [
        'tax', 'tax_rate', 'taxrate', 'tax_percent', 'taxpercent',
        'vat_rate', 'vatrate', 'gst_rate', 'gstrate', 'sales_tax',
        'income_tax', 'tax_amount', 'tax_value',
    ])) return '18';

    if (matches(k, [
        'discount', 'discount_rate', 'discountrate', 'discount_percent',
        'discountpercent', 'promo_code', 'promocode', 'coupon', 'coupon_code',
        'couponcode', 'voucher', 'voucher_code', 'vouchercode', 'offer_code',
        'offercode', 'referral_code', 'referralcode', 'affiliate_code',
        'affiliatecode', 'promo', 'deal_code',
    ])) return 'SAVE10';

    if (matches(k, [
        'invoice_number', 'invoicenumber', 'invoice_no', 'invoiceno',
        'invoice_id', 'invoiceid', 'bill_number', 'billnumber',
        'bill_no', 'billno', 'receipt_number', 'receiptnumber',
        'receipt_no', 'receiptno', 'receipt_id', 'receiptid',
        'order_number', 'ordernumber', 'order_no', 'orderno',
        'order_id', 'orderid', 'transaction_id', 'transactionid',
        'txn_id', 'txnid', 'payment_id', 'paymentid', 'ref_number',
        'reference_number', 'referencenumber', 'ref_no', 'refno',
        'booking_number', 'bookingnumber', 'booking_id', 'bookingid',
        'ticket_number', 'ticketnumber', 'ticket_id', 'ticketid',
        'case_number', 'casenumber', 'case_id', 'caseid',
        'application_number', 'applicationnumber', 'application_id',
        'applicationid', 'tracking_number', 'trackingnumber', 'tracking_id',
        'trackingid', 'shipment_id', 'shipmentid', 'parcel_id', 'parcelid',
    ])) return faker.string.alphanumeric(10).toUpperCase();

    if (matches(k, [
        'bank_name', 'bankname', 'bank', 'financial_institution',
        'bank_branch', 'bankbranch', 'branch_name', 'branchname',
        'branch', 'branch_location', 'home_branch',
    ])) return faker.helpers.arrayElement(['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Bank of America', 'Chase Bank', 'Wells Fargo', 'Barclays', 'HSBC']);

    if (matches(k, [
        'upi', 'upi_id', 'upiid', 'upi_address', 'vpa', 'virtual_payment',
        'gpay', 'paytm', 'phonepe', 'payment_handle',
    ])) return `${faker.internet.username()}@upi`;

    if (matches(k, [
        'crypto_address', 'wallet_address', 'bitcoin_address', 'eth_address',
        'btc_address', 'crypto_wallet', 'blockchain_address',
    ])) return '0x' + faker.string.hexadecimal({ length: 40, casing: 'lower' }).replace('0x', '');

    // 8. E-commerce & Logistics
    if (matches(k, [
        'sku', 'product_id', 'barcode', 'ean', 'upc', 'sku_code',
        'skucode', 'item_code', 'itemcode', 'item_id', 'itemid',
        'product_code', 'productcode', 'model_number', 'modelnumber',
        'model_no', 'modelno', 'catalog_number', 'catalognumber',
        'catalog_id', 'catalogid', 'part_number', 'partnumber',
        'part_no', 'partno', 'asin', 'isbn', 'issn', 'serial_number',
        'serialnumber', 'serial_no', 'serialno', 'gtin', 'mpn',
        'manufacturer_part_number', 'vendor_sku', 'seller_sku',
    ])) return faker.string.alphanumeric(10).toUpperCase();

    if (matches(k, [
        'product', 'item_name', 'model', 'product_name', 'productname',
        'item', 'merchandise', 'goods', 'article', 'listing_title',
        'listing_name', 'product_title', 'producttitle', 'item_title',
        'search_term', 'keyword', 'query_term',
    ])) return faker.commerce.productName();

    if (matches(k, [
        'category', 'dept', 'department', 'product_category', 'productcategory',
        'item_category', 'itemcategory', 'product_type', 'producttype',
        'item_type', 'itemtype', 'classification', 'segment', 'vertical',
        'genre', 'section', 'aisle', 'catalog_category',
    ])) return faker.commerce.department();

    if (matches(k, [
        'qty', 'quantity', 'stock', 'inventory', 'count', 'number_of_items',
        'item_count', 'itemcount', 'units', 'pieces', 'pcs',
        'number_of_units', 'num_units', 'num_items', 'num_pieces',
        'total_units', 'order_qty', 'orderqty', 'purchase_qty',
        'cart_qty', 'min_qty', 'max_qty', 'available_qty',
        'in_stock', 'instock', 'stock_qty', 'stockqty',
    ])) return faker.number.int({ min: 1, max: 100 }).toString();

    if (matches(k, [
        'weight', 'mass', 'product_weight', 'item_weight', 'net_weight',
        'gross_weight', 'shipping_weight', 'package_weight', 'parcel_weight',
        'weight_kg', 'weight_lbs', 'weight_grams',
    ])) return `${faker.number.int({ min: 1, max: 50 })} kg`;

    if (matches(k, [
        'vinnumber', 'vin', 'chassis', 'chassis_number', 'chassisnumber',
        'vehicle_id', 'vehicleid', 'vehicle_number', 'vehiclenumber',
        'reg_number', 'registration_number', 'registrationnumber',
        'license_plate', 'licenseplate', 'plate_number', 'platenumber',
        'numberplate', 'number_plate',
    ])) return faker.vehicle.vin();

    if (matches(k, [
        'vehicle_make', 'car_make', 'manufacturer',
    ])) return faker.vehicle.manufacturer();

    if (matches(k, [
        'vehicle_model', 'car_model',
    ])) return faker.vehicle.model();

    if (matches(k, [
        'vehicle_type', 'car_type', 'vehicle_category',
    ])) return faker.vehicle.type();

    if (matches(k, [
        'vehicle_color', 'car_color', 'vehicle_colour', 'car_colour',
    ])) return faker.vehicle.color();

    if (matches(k, [
        'vehicle_fuel', 'fuel_type', 'fueltype', 'fuel',
    ])) return faker.vehicle.fuel();

    if (matches(k, [
        'dimensions', 'size', 'measurements', 'product_size',
    ])) return `${faker.number.int({ min: 5, max: 100 })} x ${faker.number.int({ min: 5, max: 100 })} x ${faker.number.int({ min: 5, max: 100 })} cm`;

    if (matches(k, [
        'color', 'colour', 'hex', 'color_code', 'colorcode', 'hex_code',
        'hexcode', 'html_color', 'css_color', 'primary_color', 'accent_color',
        'background_color', 'text_color', 'foreground_color',
    ])) return faker.color.rgb({ format: 'hex' });

    if (matches(k, [
        'material', 'fabric', 'textile', 'product_material',
    ])) return faker.helpers.arrayElement(['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool', 'Nylon', 'Linen', 'Denim', 'Synthetic', 'Bamboo']);

    if (matches(k, [
        'condition', 'item_condition', 'product_condition',
    ])) return faker.helpers.arrayElement(['New', 'Like New', 'Good', 'Fair', 'Poor', 'Refurbished']);

    if (matches(k, [
        'tracking_number', 'trackingnumber', 'tracking_id', 'trackingid',
        'shipment_tracking', 'courier_tracking',
    ])) return faker.string.alphanumeric(15).toUpperCase();

    if (matches(k, [
        'courier', 'courier_name', 'courier_service', 'shipping_service',
        'delivery_service', 'logistic', 'logistics_provider', 'carrier',
        'shipping_carrier', 'delivery_carrier',
    ])) return faker.helpers.arrayElement(['FedEx', 'DHL', 'UPS', 'USPS', 'BlueDart', 'Delhivery', 'Amazon Logistics', 'Ekart', 'Aramex']);

    if (matches(k, [
        'delivery_date', 'deliverydate', 'expected_delivery', 'eta',
        'estimated_delivery', 'ship_date', 'shipdate', 'dispatch_date',
        'dispatchdate', 'arrival_date', 'arrivaldate',
    ])) return faker.date.future().toISOString().split('T')[0]!;

    if (matches(k, [
        'return_policy', 'returnpolicy', 'return_window', 'warranty',
        'warranty_period', 'guarantee',
    ])) return '30 days return policy';

    // 9. Professional & Education
    if (matches(k, [
        'company', 'organization', 'org', 'employer', 'firm',
        'company_name', 'companyname', 'organization_name', 'organizationname',
        'org_name', 'orgname', 'employer_name', 'employername',
        'firm_name', 'firmname', 'business_name', 'businessname',
        'enterprise', 'enterprise_name', 'corporation', 'corp',
        'institution', 'institute', 'agency', 'agency_name', 'agencyname',
        'client_company', 'vendor_company', 'partner_company',
        'current_company', 'previous_company', 'former_employer',
        'current_employer', 'last_employer', 'startup_name',
        'brand', 'brand_name', 'brandname', 'trade_name', 'tradename',
        'dba', 'doing_business_as', 'company_legal_name',
    ])) return faker.company.name();

    if (matches(k, [
        'jobtitle', 'designation', 'role', 'position', 'job_title',
        'job_role', 'jobrole', 'job_position', 'jobposition',
        'employment_title', 'work_title', 'worktitle', 'career_title',
        'professional_title', 'current_role', 'current_position',
        'current_designation', 'applied_position', 'applied_for',
        'post', 'post_applied', 'vacancy', 'job_profile', 'jobprofile',
        'staff_designation', 'employee_designation', 'title_of_job',
        'role_name', 'rolename', 'position_name', 'positionname',
    ])) return faker.person.jobTitle();

    if (matches(k, [
        'experience', 'exp', 'years_of_work', 'work_experience',
        'workexperience', 'years_of_experience', 'yearsofexperience',
        'total_experience', 'totalexperience', 'relevant_experience',
        'professional_experience', 'industry_experience', 'domain_experience',
        'yoe', 'years_exp', 'exp_years', 'total_exp', 'experience_years',
    ])) return faker.number.int({ min: 1, max: 15 }).toString();

    if (matches(k, [
        'school', 'college', 'university', 'insti', 'institution',
        'school_name', 'schoolname', 'college_name', 'collegename',
        'university_name', 'universityname', 'institution_name',
        'institutionname', 'alma_mater', 'almamater', 'attended',
        'graduate_from', 'graduated_from', 'studied_at', 'education_institute',
        'academic_institution', 'polytechnic', 'iit', 'nit', 'deemed',
        'current_school', 'previous_school', 'high_school', 'highschool',
        'middle_school', 'elementary_school', 'primary_school',
    ])) return faker.company.name() + ' University';

    if (matches(k, [
        'degree', 'qualification', 'educational_qualification', 'academic_qualification',
        'highest_qualification', 'education_level', 'academic_level',
        'educational_level', 'course', 'course_name', 'coursename',
        'program', 'program_name', 'programname', 'major', 'major_subject',
        'specialization', 'stream', 'branch', 'study_field',
        'field_of_study', 'area_of_study', 'concentration',
        'certification', 'certificate', 'diploma', 'masters', 'bachelors',
        'phd', 'doctorate',
    ])) return 'Bachelor of Technology';

    if (matches(k, [
        'gpa', 'cgpa', 'marks', 'grade', 'percentage', 'score',
        'academic_score', 'test_score', 'exam_score', 'result',
        'aggregate', 'aggregate_marks', 'total_marks', 'marks_obtained',
        'semester_gpa', 'cumulative_gpa', 'academic_percentage',
        'grade_point', 'gradepoint', 'academic_grade',
    ])) return (faker.number.float({ min: 6, max: 10, fractionDigits: 1 })).toFixed(1);

    if (matches(k, [
        'skills', 'skill_set', 'skillset', 'technical_skills', 'soft_skills',
        'core_competencies', 'competencies', 'expertise', 'proficiencies',
        'abilities', 'capabilities', 'key_skills', 'primary_skills',
        'secondary_skills', 'languages_known', 'tools', 'technologies',
    ])) return 'JavaScript, TypeScript, React, Node.js, SQL';

    if (matches(k, [
        'certifications', 'certificates', 'credential', 'credentials',
        'license', 'licensed', 'accreditation', 'certification_name',
        'cert', 'certs',
    ])) return 'AWS Certified Developer, Google Cloud Associate';

    if (matches(k, [
        'projects', 'project_name', 'projectname', 'work_project',
        'academic_project', 'portfolio_project',
    ])) return 'E-Commerce Platform, Task Management App';

    if (matches(k, [
        'achievements', 'accomplishments', 'awards', 'honors', 'honours',
        'accolades', 'recognition', 'distinctions',
    ])) return 'Employee of the Year 2023, Dean\'s List';

    if (matches(k, [
        'hobby', 'hobbies', 'interests', 'extracurricular', 'extra_curricular',
        'passion', 'leisure', 'activities',
    ])) return 'Reading, Photography, Hiking';

    if (matches(k, [
        'objective', 'career_objective', 'careerobjective', 'job_objective',
        'professional_objective', 'goal', 'career_goal', 'career_summary',
        'careersummary', 'professional_summary', 'professionalsummary',
        'profile_summary', 'executive_summary',
    ])) return 'Motivated professional seeking opportunities to apply technical expertise in a dynamic environment.';

    if (matches(k, [
        'linkedin', 'linkedin_url', 'linkedin_profile', 'linkedin_id',
        'linkedin_username', 'linkedin_handle',
    ])) return `https://linkedin.com/in/${faker.internet.username()}`;

    if (matches(k, [
        'department_name', 'dept_name', 'deptname', 'team', 'team_name',
        'teamname', 'division_name', 'divisionname', 'unit_name', 'unitname',
    ])) return faker.helpers.arrayElement(['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Design', 'Product', 'Legal', 'Customer Success']);

    if (matches(k, [
        'employee_id', 'employeeid', 'employee_no', 'employeeno', 'emp_id',
        'empid', 'staff_id', 'staffid', 'worker_id', 'workerid',
        'person_id', 'personid', 'hr_id', 'hrid',
    ])) return 'EMP' + faker.string.numeric(6);

    if (matches(k, [
        'joining_date', 'joiningdate', 'join_date', 'joindate',
        'start_date', 'startdate', 'commencement_date', 'hire_date',
        'hiredate', 'employment_start', 'onboarding_date',
    ])) return faker.date.past().toISOString().split('T')[0]!;

    if (matches(k, [
        'leaving_date', 'leavingdate', 'end_date', 'enddate',
        'exit_date', 'exitdate', 'termination_date', 'last_date',
        'resignation_date', 'employment_end',
    ])) return faker.date.recent().toISOString().split('T')[0]!;

    if (matches(k, [
        'notice_period', 'noticeperiod', 'notice', 'availability',
        'available_from', 'joining_time',
    ])) return '30 days';

    if (matches(k, [
        'work_mode', 'workmode', 'work_type', 'employment_type',
        'employmenttype', 'job_type', 'jobtype', 'contract_type',
    ])) return faker.helpers.arrayElement(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid', 'On-site']);

    if (matches(k, [
        'industry', 'industry_type', 'sector', 'business_sector',
        'industry_name', 'field', 'domain', 'vertical_name',
    ])) return faker.helpers.arrayElement(['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Logistics']);

    // 10. Digital Assets
    if (matches(k, [
        'ip', 'ipaddress', 'ipv4', 'ip_address', 'ip_addr',
        'client_ip', 'server_ip', 'remote_ip', 'local_ip',
        'source_ip', 'dest_ip', 'destination_ip', 'origin_ip',
        'host_ip', 'public_ip', 'private_ip', 'static_ip',
    ])) return faker.internet.ipv4();

    if (matches(k, [
        'ipv6', 'ip_v6', 'ipv6_address', 'ipv6_addr',
    ])) return faker.internet.ipv6();

    if (matches(k, [
        'mac', 'macaddress', 'mac_address', 'mac_addr',
        'hardware_address', 'physical_address', 'network_address',
        'ethernet_address', 'device_mac', 'wifi_mac',
    ])) return faker.internet.mac();

    if (matches(k, [
        'uuid', 'guid', 'ref_id', 'unique_id', 'uniqueid',
        'global_id', 'globalid', 'system_id', 'systemid',
        'correlation_id', 'correlationid', 'session_id', 'sessionid',
        'request_id', 'requestid', 'trace_id', 'traceid', 'span_id',
        'spanid', 'entity_id', 'entityid', 'record_id', 'recordid',
        'document_id', 'documentid', 'object_id', 'objectid',
        'resource_id', 'resourceid', 'asset_id', 'assetid',
        'instance_id', 'instanceid', 'job_id', 'jobid',
        'workflow_id', 'workflowid', 'process_id', 'processid',
        'task_id', 'taskid', 'event_id', 'eventid',
    ])) return faker.string.uuid();

    if (matches(k, [
        'slug', 'permalink', 'url_slug', 'urlslug', 'path',
        'url_path', 'urlpath', 'friendly_url', 'seo_url',
        'canonical_url', 'post_slug', 'page_slug', 'article_slug',
        'product_slug', 'category_slug',
    ])) return faker.helpers.slugify(faker.lorem.words(3));

    if (matches(k, [
        'agent', 'user_agent', 'useragent', 'browser', 'browser_name',
        'browsername', 'client_name', 'clientname',
    ])) return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    if (matches(k, [
        'port', 'port_number', 'portnumber', 'network_port',
        'server_port', 'service_port',
    ])) return faker.internet.port().toString();

    if (matches(k, [
        'hostname', 'host_name', 'server_name', 'servername',
        'domain_name', 'fqdn', 'host',
    ])) return faker.internet.domainName();

    if (matches(k, [
        'api_endpoint', 'endpoint', 'base_url', 'baseurl',
        'api_url', 'apiurl', 'service_url', 'serviceurl',
    ])) return `https://api.${faker.internet.domainName()}/v1`;

    if (matches(k, [
        'mime_type', 'content_type', 'file_type', 'filetype',
        'media_type', 'mediatype', 'format', 'file_format',
    ])) return faker.helpers.arrayElement(['application/json', 'text/html', 'image/png', 'application/pdf', 'video/mp4']);

    if (matches(k, [
        'file_name', 'filename', 'file_path', 'filepath', 'document_name',
        'documentname', 'attachment_name', 'attachmentname',
    ])) return `${faker.lorem.word()}_${faker.string.numeric(4)}.pdf`;

    if (matches(k, [
        'file_size', 'filesize', 'document_size',
    ])) return `${faker.number.int({ min: 1, max: 10 })} MB`;

    if (matches(k, [
        'version', 'version_number', 'versionnumber', 'app_version',
        'software_version', 'release', 'build', 'build_number',
    ])) return `${faker.number.int({ min: 1, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 99 })}`;

    if (matches(k, [
        'environment', 'env', 'deployment_env', 'app_env',
    ])) return faker.helpers.arrayElement(['production', 'staging', 'development', 'testing']);

    // 11. Dates & Time
    if (matches(k, [
        'start_date', 'startdate', 'from_date', 'fromdate', 'begin_date',
        'begindate', 'commencement', 'effective_date', 'effectivedate',
        'valid_from', 'validfrom', 'issue_date', 'issuedate',
        'created_date', 'createddate', 'registration_date', 'enrollmentdate',
    ])) return faker.date.past().toISOString().split('T')[0]!;

    if (matches(k, [
        'end_date', 'enddate', 'to_date', 'todate', 'expiry_date',
        'expirydate', 'expiration_date', 'expirationdate', 'valid_to',
        'validto', 'valid_till', 'close_date', 'closedate',
        'deadline', 'due_date', 'duedate', 'target_date', 'targetdate',
        'completion_date', 'completiondate',
    ])) return faker.date.future().toISOString().split('T')[0]!;

    if (matches(k, [
        'schedule_date', 'scheduledate', 'appointment_date', 'appointmentdate',
        'meeting_date', 'meetingdate', 'event_date', 'eventdate',
        'interview_date', 'interviewdate', 'visit_date', 'visitdate',
        'booking_date', 'bookingdate', 'reservation_date', 'reservationdate',
        'check_in', 'checkin', 'check_out', 'checkout',
        'travel_date', 'traveldate', 'departure_date', 'departuredate',
        'arrival_date', 'arrivaldate', 'flight_date',
    ])) return faker.date.future().toISOString().split('T')[0]!;

    if (matches(k, [
        'year', 'current_year', 'fiscal_year', 'financial_year',
        'academic_year', 'graduation_year', 'passing_year',
        'establishment_year', 'founded_year', 'incorporation_year',
    ])) return faker.date.past({ years: 5 }).getFullYear().toString();

    if (matches(k, [
        'month', 'current_month', 'birth_month',
    ])) return (faker.date.recent().getMonth() + 1).toString();

    if (matches(k, [
        'day', 'current_day', 'birth_day', 'day_of_month',
    ])) return faker.number.int({ min: 1, max: 28 }).toString();

    if (matches(k, [
        'duration', 'duration_days', 'duration_months', 'duration_years',
        'length', 'period', 'tenure', 'term', 'validity_period',
        'contract_duration', 'subscription_period', 'course_duration',
    ])) return `${faker.number.int({ min: 1, max: 24 })} months`;

    // 12. Healthcare & Medical
    if (matches(k, [
        'patient_id', 'patientid', 'medical_record', 'mr_number',
        'health_id', 'healthid', 'insurance_id', 'insuranceid',
        'policy_number', 'policynumber', 'policy_no', 'policyno',
        'member_number', 'membernumber', 'subscriber_id', 'subscriberid',
    ])) return 'PAT' + faker.string.numeric(8);

    if (matches(k, [
        'diagnosis', 'condition', 'medical_condition', 'ailment',
        'disease', 'illness', 'disorder',
    ])) return faker.helpers.arrayElement(['Hypertension', 'Diabetes Type 2', 'Asthma', 'Arthritis', 'None']);

    if (matches(k, [
        'medication', 'medicine', 'drug', 'prescription', 'rx',
        'current_medication', 'medications',
    ])) return faker.helpers.arrayElement(['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'None']);

    if (matches(k, [
        'allergies', 'allergy', 'drug_allergy', 'food_allergy',
        'known_allergies',
    ])) return faker.helpers.arrayElement(['None', 'Penicillin', 'Peanuts', 'Latex', 'Aspirin']);

    if (matches(k, [
        'doctor_name', 'physician_name', 'physician', 'doctor',
        'primary_doctor', 'specialist', 'consultant',
    ])) return `Dr. ${faker.person.fullName()}`;

    if (matches(k, [
        'hospital', 'hospital_name', 'clinic', 'clinic_name',
        'medical_facility', 'healthcare_provider', 'health_center',
    ])) return `${faker.location.city()} Medical Center`;

    if (matches(k, [
        'insurance_company', 'insurance_provider', 'insurer',
        'health_insurer', 'insurance_name',
    ])) return faker.helpers.arrayElement(['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Star Health', 'HDFC Ergo']);

    if (matches(k, [
        'emergency_contact', 'emergency_name', 'emergency_contact_name',
        'next_of_kin', 'kin_name', 'guardian_name', 'guardianname',
        'nominee', 'nominee_name', 'nomineename',
    ])) return faker.person.fullName();

    if (matches(k, [
        'relationship', 'relation', 'relation_type', 'relationship_to',
        'kinship', 'family_relation', 'relation_with_insured',
        'nominee_relation', 'contact_relation',
    ])) return faker.helpers.arrayElement(['Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Friend', 'Guardian', 'Parent']);

    // 13. Real Estate & Property
    if (matches(k, [
        'property_id', 'propertyid', 'property_no', 'propertyno',
        'listing_id', 'listingid', 'property_code', 'propertycode',
        'mls_number', 'mlsnumber',
    ])) return 'PROP' + faker.string.numeric(8);

    if (matches(k, [
        'property_type', 'propertytype', 'home_type', 'hometype',
        'house_type', 'housetype', 'real_estate_type',
    ])) return faker.helpers.arrayElement(['Apartment', 'House', 'Villa', 'Studio', 'Duplex', 'Townhouse', 'Condo', 'Penthouse', 'Commercial', 'Office']);

    if (matches(k, [
        'bedrooms', 'bedroom', 'bhk', 'bed_rooms', 'no_of_bedrooms',
        'number_of_bedrooms', 'beds',
    ])) return faker.number.int({ min: 1, max: 6 }).toString();

    if (matches(k, [
        'bathrooms', 'bathroom', 'baths', 'no_of_bathrooms',
        'number_of_bathrooms',
    ])) return faker.number.int({ min: 1, max: 4 }).toString();

    if (matches(k, [
        'area', 'square_feet', 'sqft', 'sq_ft', 'carpet_area',
        'built_up_area', 'super_area', 'plot_area', 'land_area',
        'total_area', 'floor_area',
    ])) return `${faker.number.int({ min: 500, max: 5000 })} sqft`;

    if (matches(k, [
        'rent', 'monthly_rent', 'rental_amount', 'lease_amount',
        'rent_per_month', 'rental_price',
    ])) return faker.commerce.price({ min: 5000, max: 100000 });

    if (matches(k, [
        'lease_term', 'lease_duration', 'rental_period', 'tenancy_period',
    ])) return faker.helpers.arrayElement(['6 months', '1 year', '2 years', '3 years', 'Month to Month']);

    // 14. Travel & Hospitality
    if (matches(k, [
        'destination', 'travel_destination', 'trip_destination',
        'to_city', 'arrival_city', 'to_location',
    ])) return faker.location.city();

    if (matches(k, [
        'origin', 'from_city', 'departure_city', 'from_location',
        'source_location', 'source_city',
    ])) return faker.location.city();

    if (matches(k, [
        'flight_number', 'flightnumber', 'flight_no', 'flightno',
    ])) return `${faker.helpers.arrayElement(['AA', 'BA', 'EK', 'QF', 'SQ'])}${faker.number.int({ min: 100, max: 9999 })}`;

    if (matches(k, [
        'airline', 'airline_name', 'carrier_name',
    ])) return faker.helpers.arrayElement(['American Airlines', 'British Airways', 'Emirates', 'Qantas', 'Singapore Airlines', 'Lufthansa', 'Cathay Pacific']);

    if (matches(k, [
        'seat_number', 'seat_no', 'seat_num', 'boarding_gate', 'terminal',
    ])) return `${faker.number.int({ min: 1, max: 50 })}${faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E', 'F'])}`;

    // 15. Tech & Coding Environment
    if (matches(k, [
        'programming_language', 'coding_language', 'main_language',
    ])) return faker.helpers.arrayElement(['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Swift', 'Kotlin', 'PHP']);

    if (matches(k, [
        'ide', 'editor', 'code_editor',
    ])) return faker.helpers.arrayElement(['VS Code', 'IntelliJ IDEA', 'PyCharm', 'Sublime Text', 'Vim', 'Neovim', 'WebStorm']);

    if (matches(k, [
        'framework', 'web_framework', 'tech_stack',
    ])) return faker.helpers.arrayElement(['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Express', 'Django', 'FastAPI', 'Spring Boot']);

    if (matches(k, [
        'version_control', 'vcs', 'git_platform',
    ])) return faker.helpers.arrayElement(['GitHub', 'GitLab', 'Bitbucket', 'Azure DevOps']);

    // 16. Social & Content
    if (matches(k, [
        'title', 'post_title', 'article_title', 'page_title',
        'blog_title', 'heading', 'headline', 'subject',
        'email_subject', 'mail_subject', 'topic', 'thread_title',
        'event_title', 'event_name', 'webinar_title', 'meeting_title',
        'project_title', 'task_title', 'issue_title', 'ticket_title',
    ])) return faker.lorem.sentence();

    if (matches(k, [
        'content', 'body', 'message_body', 'email_body', 'post_content',
        'article_content', 'blog_content', 'description',
        'detail', 'details', 'additional_details', 'more_details',
        'full_description', 'product_description', 'job_description',
        'course_description', 'event_description', 'item_description',
        'listing_description', 'abstract', 'synopsis', 'overview',
    ])) return faker.lorem.paragraph();

    if (matches(k, [
        'tags', 'tag', 'keywords', 'keyword_list', 'meta_keywords',
        'search_tags', 'hashtags', 'label', 'labels',
    ])) return faker.lorem.words(5).split(' ').join(', ');

    if (matches(k, [
        'subject', 'email_subject', 'message_subject', 'mail_subject',
        'subject_line',
    ])) return faker.lorem.sentence();

    if (matches(k, [
        'rating', 'review_rating', 'star_rating', 'score_rating',
        'product_rating', 'overall_rating',
    ])) return faker.number.int({ min: 1, max: 5 }).toString();

    if (matches(k, [
        'review', 'review_text', 'testimonial', 'user_review',
        'product_review', 'customer_review', 'opinion',
    ])) return faker.lorem.paragraph();

    // 17. Retail & Supply Chain
    if (matches(k, [
        'warranty_period', 'warranty_duration', 'guarantee_period',
    ])) return `${faker.number.int({ min: 1, max: 5 })} Years`;

    if (matches(k, [
        'return_days', 'return_window',
    ])) return `${faker.number.int({ min: 7, max: 90 })} Days`;

    if (matches(k, [
        'hs_code', 'hsn_code', 'tax_category',
    ])) return faker.string.numeric(8);

    if (matches(k, [
        'origin_warehouse', 'warehouse_id', 'bin_location',
    ])) return `WH-${faker.string.alphanumeric(4).toUpperCase()}-${faker.number.int({ min: 1, max: 50 })}`;

    // 18. Large Text (Textareas)
    if (tag === 'textarea' || matches(k, [
        'bio', 'about', 'desc', 'summary', 'message', 'comment', 'feedback',
        'note', 'notes', 'remarks', 'remark', 'description', 'details',
        'additional_info', 'additionalinfo', 'more_info', 'moreinfo',
        'other_info', 'otherinfo', 'extra_info', 'extrainfo',
        'cover_letter', 'coverletter', 'personal_statement', 'personalstatement',
        'statement_of_purpose', 'sop', 'letter_of_intent', 'motivation_letter',
        'introduction', 'intro', 'profile_description', 'profile_bio',
        'self_description', 'about_me', 'aboutme', 'who_i_am',
        'why_us', 'why_join', 'reason_for_applying', 'reason_for_interest',
        'additional_comments', 'special_requirements', 'special_instructions',
        'delivery_instructions', 'order_notes', 'shipping_notes',
        'medical_notes', 'clinical_notes', 'doctor_notes', 'prescription_notes',
        'legal_notes', 'terms_notes', 'compliance_notes',
        'project_description', 'task_description', 'issue_description',
        'bug_description', 'enhancement_description', 'request_description',
        'inquiry_description', 'support_description',
        'incident_description', 'accident_description', 'claim_description',
        'justification', 'explanation', 'reasoning', 'rationale',
        'narrative', 'story', 'background', 'context',
        'executive_summary', 'business_description', 'company_overview',
        'mission', 'vision', 'mission_statement', 'vision_statement',
        'property_description', 'amenities', 'room_description',
        'itinerary', 'trip_description', 'agenda', 'plan',
        'terms', 'conditions', 'tnc', 'disclaimer',
    ])) {
        if (matches(k, ['bio', 'about', 'aboutme', 'about_me', 'who_i_am', 'self_description'])) return faker.person.bio();
        if (matches(k, ['address'])) return faker.location.streetAddress(true);
        if (matches(k, ['cover_letter', 'coverletter', 'motivation_letter', 'letter_of_intent'])) return `Dear Hiring Manager,\n\n${faker.lorem.paragraphs(2)}\n\nSincerely,\n${faker.person.fullName()}`;
        if (matches(k, ['sop', 'statement_of_purpose', 'personal_statement'])) return faker.lorem.paragraphs(3);
        return faker.lorem.paragraph();
    }

    // 17. Miscellaneous
    if (matches(k, [
        'language', 'preferred_language', 'native_language', 'spoken_language',
        'programming_language', 'locale', 'lang',
    ])) return faker.helpers.arrayElement(['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Portuguese', 'Japanese', 'Korean']);

    if (matches(k, [
        'timezone', 'time_zone', 'tz', 'user_timezone', 'local_tz',
    ])) return faker.location.timeZone();

    if (matches(k, [
        'theme', 'ui_theme', 'color_theme', 'app_theme',
    ])) return faker.helpers.arrayElement(['Light', 'Dark', 'Auto', 'System']);

    if (matches(k, [
        'font', 'font_family', 'fontfamily', 'typography',
    ])) return faker.helpers.arrayElement(['Arial', 'Roboto', 'Inter', 'Open Sans', 'Lato', 'Montserrat']);

    if (matches(k, [
        'plan', 'subscription_plan', 'price_plan', 'billing_plan',
        'membership_plan', 'account_plan', 'tier',
    ])) return faker.helpers.arrayElement(['Free', 'Basic', 'Pro', 'Business', 'Enterprise', 'Premium', 'Starter']);

    if (matches(k, [
        'status', 'current_status', 'account_status', 'order_status',
        'application_status', 'project_status', 'task_status', 'issue_status',
        'enrollment_status', 'payment_status', 'verification_status',
    ])) return faker.helpers.arrayElement(['Active', 'Inactive', 'Pending', 'Approved', 'Rejected', 'In Review', 'Completed', 'Draft']);

    if (matches(k, [
        'priority', 'task_priority', 'issue_priority', 'request_priority',
        'urgency', 'severity',
    ])) return faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical', 'Urgent']);

    if (matches(k, [
        'source', 'lead_source', 'traffic_source', 'referral_source',
        'how_did_you_hear', 'heard_from', 'referred_by',
    ])) return faker.helpers.arrayElement(['Google', 'LinkedIn', 'Facebook', 'Referral', 'Email Campaign', 'Direct', 'Event', 'Twitter']);

    if (matches(k, [
        'device', 'device_type', 'device_name', 'platform',
        'operating_system', 'os', 'system',
    ])) return faker.helpers.arrayElement(['iOS', 'Android', 'Windows', 'MacOS', 'Linux', 'Web']);

    if (matches(k, [
        'reason', 'purpose', 'intention', 'objective_field',
        'cancellation_reason', 'refund_reason', 'return_reason',
        'dispute_reason', 'complaint_reason', 'leave_reason',
    ])) return faker.lorem.sentence();

    if (matches(k, [
        'code', 'activation_code', 'activation_key', 'license_key',
        'serial_key', 'product_key', 'productkey', 'registration_code',
        'invite_code', 'invitation_code', 'referral',
    ])) return faker.string.alphanumeric(16).toUpperCase();

    if (matches(k, [
        'question', 'faq_question', 'support_question', 'inquiry',
        'enquiry', 'query', 'help_question',
    ])) return faker.lorem.sentence() + '?';

    if (matches(k, [
        'answer', 'faq_answer', 'support_answer', 'response_text',
        'reply_text', 'solution',
    ])) return faker.lorem.paragraph();

    if (matches(k, [
        'template', 'template_name', 'template_title',
    ])) return `${faker.lorem.word()} Template`;

    if (matches(k, [
        'campaign', 'campaign_name', 'ad_campaign', 'marketing_campaign',
    ])) return `${faker.lorem.word()} ${faker.date.recent().getFullYear()} Campaign`;

    if (matches(k, [
        'label', 'display_label', 'field_label', 'tag_name',
    ])) return faker.lorem.word();

    if (matches(k, [
        'rank', 'ranking', 'position_rank', 'order',
    ])) return faker.number.int({ min: 1, max: 100 }).toString();

    if (matches(k, [
        'max', 'maximum', 'max_value', 'upper_limit', 'cap',
    ])) return faker.number.int({ min: 100, max: 10000 }).toString();

    if (matches(k, [
        'min', 'minimum', 'min_value', 'lower_limit', 'floor',
    ])) return faker.number.int({ min: 1, max: 100 }).toString();

    if (matches(k, [
        'percentage', 'percent', 'pct', 'rate', 'ratio',
    ])) return faker.number.int({ min: 1, max: 100 }).toString();

    if (matches(k, [
        'seats', 'capacity', 'max_capacity', 'total_seats', 'num_seats',
        'available_seats', 'participants', 'attendees',
    ])) return faker.number.int({ min: 10, max: 1000 }).toString();

    if (matches(k, [
        'longitude_degrees', 'latitude_degrees', 'coordinates',
    ])) return `${faker.location.latitude()}, ${faker.location.longitude()}`;

    if (matches(k, [
        'sort', 'sort_order', 'sort_by', 'order_by', 'display_order',
        'menu_order', 'sequence', 'sequence_number', 'position_order',
    ])) return faker.number.int({ min: 1, max: 100 }).toString();

    // 18. Fallbacks
    if (type === 'number') return faker.number.int({ min: 1, max: 100 }).toString();
    if (k.length > 2) return faker.lorem.words(2);
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

    if (type === 'color') {
        (el as HTMLInputElement).value = value; // must be a valid #rrggbb hex
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }

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