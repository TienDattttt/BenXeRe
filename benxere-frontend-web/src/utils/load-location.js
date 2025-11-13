import tinhTp from "../tinh_tp.json"; 
export const loadLocations = () => {
  return Object.values(tinhTp).map((location) => ({
    value: location.code,
    label: location.name_with_type,
  }));
};
const locations = loadLocations();

export const getLocationNameByCode = (code) => {
  const location = locations.find((loc) => loc.value === code);
  return location ? location.label : code;
};
