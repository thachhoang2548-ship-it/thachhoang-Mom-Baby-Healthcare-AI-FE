import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPills, faStethoscope, faBell, faUtensils, faFileMedical } from "@fortawesome/free-solid-svg-icons";

const icons = { pills: faPills, stethoscope: faStethoscope, bell: faBell, utensils: faUtensils, file: faFileMedical };

const Icon = ({ name, className }) => {
  return <FontAwesomeIcon icon={icons[name]} className={className} />;
};

export default Icon;
