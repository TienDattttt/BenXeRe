import React, { useContext } from 'react';
import classNames from "classnames";
import Typography from "../../../components/core/typography";
import SeatSelector from "../../../components/seat-selector";
import { formatAmount } from "../../../utils/common";
import { CommonDispatchContext, CommonStateContext, setCurrentSchedule } from "../../../contexts/common";

const SchedulesItem = ({ schedule }) => {
  const { selectedSchedule } = useContext(CommonStateContext);
  const dispatch = useContext(CommonDispatchContext);
  const isSelected = schedule?.id === selectedSchedule?.id;

  const baseClass = "bg-slate-100 hover:bg-amber-100 hover:cursor-pointer rounded-lg mb-5";

  const handleSelectSchedule = (scheduleData) => {
    setCurrentSchedule(dispatch, scheduleData);
  };
  
  return (
    <div
      className={classNames(baseClass, {
        "bg-amber-200": isSelected,
      })}
    >
      <div
        className="flex items-center p-5"
        onClick={() => handleSelectSchedule(schedule)}
      >
        <div className="w-2/5">
          <Typography variant="h3">{schedule.busName}</Typography>
          <Typography className="font-bold text-slate-600">
            {`${schedule.busRating}/5`}
          </Typography>
        </div>

        <div className="w-1/5">
          <Typography className="text-slate-400">Arrival</Typography>
          <Typography>{schedule.arrival}</Typography>
        </div>

        <div className="w-1/5">
          <Typography className="text-slate-400">Departure</Typography>
          <Typography>{schedule.departure}</Typography>
        </div>

        <Typography
          variant="h2"
          className="font-bold text-2xl ml-auto w-1/5 text-right"
        >
          {formatAmount(schedule.pricing)}
        </Typography>
      </div>
      {isSelected && (
        <div className="p-5 rounded-b-lg">
          <SeatSelector />
        </div>
      )}
    </div>
  );
};

export default SchedulesItem;