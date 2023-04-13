use dep::std;

mod data;

global VALUE_rs10757274: str<2> = "GG";
global VALUE_rs1801133: str<2> = "TT";

// Count number of people with GG at rs10757274
fn compute_rs10757274_GG_percentage(private_data: data::PrivateData) -> Field {
    let total = 4;

    let mut count = 0;

    if (private_data.auth_a.data.patient_id_0.genetic_data.rs10757274 == VALUE_rs10757274) {
        count = count + 1;
    }
    if (private_data.auth_a.data.patient_id_1.genetic_data.rs10757274 == VALUE_rs10757274) {
        count = count + 1;
    }
    if (private_data.auth_b.data.patient_id_0.genetic_data.rs10757274 == VALUE_rs10757274) {
        count = count + 1;
    }
    if (private_data.auth_b.data.patient_id_1.genetic_data.rs10757274 == VALUE_rs10757274) {
        count = count + 1;
    }

    let mut percentage = count * 100 / total;

    percentage
}


// Count number of people with TT at rs1801133
fn compute_rs1801133_TT_percentage(private_data: data::PrivateData) -> Field {
    let total = 4;

    let mut count = 0;

    if (private_data.auth_a.data.patient_id_0.genetic_data.rs1801133 == VALUE_rs1801133) {
        count = count + 1;
    }
    if (private_data.auth_a.data.patient_id_1.genetic_data.rs1801133 == VALUE_rs1801133) {
        count = count + 1;
    }
    if (private_data.auth_b.data.patient_id_0.genetic_data.rs1801133 == VALUE_rs1801133) {
        count = count + 1;
    }
    if (private_data.auth_b.data.patient_id_1.genetic_data.rs1801133 == VALUE_rs1801133) {
        count = count + 1;
    }

    let mut percentage = count * 100 / total;

    percentage
}


fn main(
    private_data : data::PrivateData,
    public_keys : pub data::PublicKeys,
    public_statements : pub data::PublicStatements
    ) {

    // dummy checks
    constrain public_keys.company_a == 31408930950303160359960467821144649185997809649020691559087946667608250512807;

    constrain public_keys.company_b == 38767812175157612390478214943129528463339579156200482434025911544866189712150;

    constrain compute_rs10757274_GG_percentage(private_data) == public_statements.rs10757274_GG_percentage;

    constrain compute_rs1801133_TT_percentage(private_data) == public_statements.rs1801133_TT_percentage;

}
