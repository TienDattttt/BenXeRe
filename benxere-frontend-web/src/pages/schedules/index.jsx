import React, { useEffect, useState, useContext, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getJSON } from "../../utils/axios";
import {
  CommonDispatchContext,
  CommonStateContext,
  getLocations,
} from "../../contexts/common";
import Loader from "../../components/loader";
import Typography from "../../components/core/typography";

// Local components
import SearchHeader from "./components/SearchHeader";
import SortForm from "./components/SortForm";
import SchedulesItem from "./components/SchedulesItem";

const SchedulesPage = () => {
  const { locations } = useContext(CommonStateContext);
  const dispatch = useContext(CommonDispatchContext);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const fromLocationName =
    locations?.find((f) => f.value === Number(from))?.label || "";
  const toLocationName =
    locations?.find((f) => f.value === Number(to))?.label || "";

  const sortedSchedules = useMemo(() => {
    let sortedData = [...schedules];
    if (sortBy === "price-asc") {
      sortedData = sortedData.sort((a, b) => (a.pricing > b.pricing ? 1 : -1));
    }
    if (sortBy === "price-dsc") {
      sortedData = sortedData.sort((a, b) => (a.pricing < b.pricing ? 1 : -1));
    }
    if (sortBy === "rating-asc") {
      sortedData = sortedData.sort((a, b) =>
        a.busRating > b.busRating ? 1 : -1
      );
    }
    if (sortBy === "rating-dsc") {
      sortedData = sortedData.sort((a, b) =>
        a.busRating < b.busRating ? 1 : -1
      );
    }
    return sortedData;
  }, [schedules, sortBy]);

  const handleModify = () => {
    navigate("/");
  };

  const handleSort = (sortData) => {
    if (sortData?.sortBy) {
      setSortBy(sortData.sortBy);
    }
  };

  useEffect(() => {
    if (from && to && date) {
      setIsLoading(true);
      const url = `/api/schedules?from=${from}&to=${to}&date=${date}`;
      getJSON(url)
        .then((response) => {
          const schedulesData = response?.data?.schedules;
          setSchedules(schedulesData);
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [from, to, date]);

  useEffect(() => {
    if (!locations) {
      getLocations(dispatch);
    }
  }, [locations, dispatch]);

  return (
    <div className="container m-auto">
      <SearchHeader 
        fromLocationName={fromLocationName}
        toLocationName={toLocationName}
        date={date}
        handleModify={handleModify}
      />

      <div>
        {isLoading && <Loader label="Fetching buses, please wait..!" />}

        {!isLoading && schedules?.length > 0 && (
          <div className="py-5">
            <div className="flex items-center justify-between mb-5">
              <Typography variant="h3" className="mb-0">
                Available Buses ({schedules?.length})
              </Typography>
              <SortForm onSort={(values) => handleSort(values)} />
            </div>
            {sortedSchedules?.map((scheduleData) => (
              <SchedulesItem key={scheduleData?.id} schedule={scheduleData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulesPage;