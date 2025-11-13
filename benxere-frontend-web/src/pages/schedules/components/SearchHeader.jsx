import React from 'react';
import Typography from "../../../components/core/typography";
import Button from "../../../components/core/button";

const SearchHeader = ({ fromLocationName, toLocationName, date, handleModify }) => {
  return (
    <div className="flex items-center gap-3 mb-3 py-3 px-5 bg-slate-300 rounded-lg text-black-400">
      <Typography variant="h3">{fromLocationName}</Typography>
      <span className="material-symbols-outlined">arrow_forward</span>
      <Typography variant="h3">{toLocationName}</Typography>
      <Typography>on</Typography>
      <Typography variant="h3">{date}</Typography>
      <Button
        variant="secondary"
        onClick={handleModify}
        className="ml-auto"
      >
        Modify
      </Button>
    </div>
  );
};

export default SearchHeader;