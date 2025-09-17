// Blood type compatibility matching system
const bloodCompatibility = {
  // Who can donate to whom
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal recipient (can only donate to AB+)
};

// Who can receive from whom
const canReceiveFrom = {
  'O-': ['O-'], // Can only receive from O-
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal recipient
};

const findCompatibleDonors = (patientBloodType) => {
  return canReceiveFrom[patientBloodType] || [];
};

const findCompatiblePatients = (donorBloodType) => {
  return bloodCompatibility[donorBloodType] || [];
};

const isCompatible = (donorBloodType, patientBloodType) => {
  return bloodCompatibility[donorBloodType]?.includes(patientBloodType) || false;
};

module.exports = {
  findCompatibleDonors,
  findCompatiblePatients,
  isCompatible,
  bloodCompatibility,
  canReceiveFrom
};