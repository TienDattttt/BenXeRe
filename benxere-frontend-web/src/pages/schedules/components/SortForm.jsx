import React from 'react';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Button from "../../../components/core/button";
import SelectField from "../../../components/core/form-controls/select-field";
import { sortOptions } from "../../../constants/common";

const sortSchema = Yup.object().shape({
  sortBy: Yup.string().required("Required"),
});

const SortForm = ({ onSort }) => {
  return (
    <Formik
      initialValues={{
        sortBy: "",
      }}
      validationSchema={sortSchema}
      onSubmit={async (values) => onSort(values)}
    >
      {({ handleSubmit }) => {
        return (
          <Form className="flex gap-3">
            <SelectField
              name="sortBy"
              placeholder="Sort by"
              options={sortOptions}
              className="!mb-0"
            />
            <Button
              type="submit"
              onClick={handleSubmit}
              variant="secondary"
              className="flex-1"
            >
              Sort Buses
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SortForm;