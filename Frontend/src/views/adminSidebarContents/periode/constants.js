
// For the Form Table
export const periodTypes = [
    { value: "pfa", label: "PFA for Teachers" },
    { value: "stageEte", label: "Summer Internship" },
    { value: "choicePFA", label: "PFA for Students" },
  ];
  
  export const errorTypeMessages = {
    "already exists":
      "There's already a period of this type during the selected dates.",
    "already open": "There's an overlapping period of the same type.",
    "Network issue": "Please check your internet connection and try again.",
    "Request timeout":
      "The server is taking too long to respond. Please try again.",
    "No changes detected": "You haven't made any changes to the period.",
  };


// for the period Table
  export const periodTypeInfo = {
    pfa: { label: "PFA for Teachers", color: "theme-bg" },
    stageEte: { label: "Summer Internship", color: "theme-bg2" },
    choicePFA: { label: "PFA for Students", color: "custom-badge" },
  };
  
  export const statusStyles = {
    Closed: { variant: "danger" },
    Open: { variant: "success" },
    "Coming Soon": { variant: "warning" },
  };