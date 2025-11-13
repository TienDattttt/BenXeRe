import * as Yup from "yup";

export const searchSchema = Yup.object().shape({
  from: Yup.string().required("Required"),
  to: Yup.string().required("Required"),
  date: Yup.string().required("Required"),
});