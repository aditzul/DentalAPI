class Patients {
    constructor(ID, FULL_NAME, CNP, BIRTH_DATE, SEX, ADDRESS, PHONE, EMAIL, PHISICAL_FILE, SECONDARY_CONTACT, MEDIC_ID, CREATED_AT, AGE){
        this.ID = ID;
        this.FULL_NAME = FULL_NAME;
        this.CNP = CNP;
        this.BIRTH_DATE = BIRTH_DATE;
        this.SEX = SEX;
        this.ADDRESS = ADDRESS;
        this.PHONE = PHONE;
        this.EMAIL = EMAIL;
        this.PHISICAL_FILE = PHISICAL_FILE,
        this.SECONDARY_CONTACT = SECONDARY_CONTACT,
        this.MEDIC_ID = MEDIC_ID;
        this.CREATED_AT = CREATED_AT;
        this.AGE = AGE
    }       
}

module.exports = Patients;