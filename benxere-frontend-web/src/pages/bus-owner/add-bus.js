import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { createBus } from "../../services/bus-service"; 
import Button from "../../components/core/button";
import InputField from "../../components/core/form-controls/input-field"; 
import Typography from "../../components/core/typography"; 
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import BusCapacitySelector from "../../components/bus-capacity-selector";

const busSchema = Yup.object().shape({
  busNumber: Yup.string().required("Required"),
  busType: Yup.string().required("Required"),
  capacity: Yup.number()
    .required("Required")
    .oneOf([5, 7, 9, 16, 24, 29, 35, 45], "Please select a valid capacity"),
  companyName: Yup.string().required("Required"),
  images: Yup.array().of(Yup.string().url("Invalid URL")).required("Required"),
});

const AddBusPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);

  const handleAddBus = async (busData) => {
    try {
      const response = await createBus(busData, files);
      console.log("Bus Creation Response:", response);
      navigate("/buses"); 
    } catch (error) {
      console.error("Bus Creation Error:", error);
    }
  };

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-lg">
        <div className="w-full p-10">
          <Typography variant="h2" className="text-center font-bold text-gray-800 mb-6">
            Add New Bus
          </Typography>
          <Formik
            initialValues={{
              busNumber: "",
              busType: "",
              capacity: "",
              companyName: "",
              images: [],
            }}
            validationSchema={busSchema}
            onSubmit={async (values) => handleAddBus(values)}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <InputField
                  name="busNumber"
                  type="text"
                  placeholder="Bus Number"
                  className="mb-4"
                />
                <InputField
                  name="busType"
                  type="text"
                  placeholder="Bus Type"
                  className="mb-4"
                />
                <div className="mb-4">
                  <BusCapacitySelector
                    value={values.capacity}
                    onChange={(value) => setFieldValue('capacity', value)}
                  />
                </div>
                <InputField
                  name="companyName"
                  type="text"
                  placeholder="Company Name"
                  className="mb-4"
                />
                <div {...getRootProps({ className: 'dropzone' })} className="mb-4 p-4 border-dashed border-2 border-gray-300 rounded-md">
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <div className="flex flex-wrap">
                  {files.map((file, index) => (
                    <img key={index} src={file.preview} alt={`preview ${index}`} className="w-24 h-24 object-cover m-2" />
                  ))}
                </div>
                <Button type="submit" variant="primary" block>
                  Add Bus
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddBusPage;