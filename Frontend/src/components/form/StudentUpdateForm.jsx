import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { updateStudent } from "services/student";

// Validation Schema for Formik
const validationSchema = Yup.object().shape({
  cin: Yup.string()
    .matches(/^\d{8}$/, "CIN must be exactly 8 digits")
    .required("CIN is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  firstName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "First name must only contain letters")
    .required("First name is required"),
  lastName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "Last name must only contain letters")
    .required("Last name is required"),
  dateOfBirth: Yup.date().max(
    new Date(),
    "Date of birth cannot be in the future"
  ),
  gender: Yup.string().oneOf(["Male", "Female"]).optional(),
  level: Yup.string().oneOf(["1", "2", "3"]).required("Level is required"),

  arabicName: Yup.string()
    .matches(
      /^[\u0621-\u064A\u0660-\u0669\s]+$/,
      "Arabic name must contain only Arabic letters and spaces"
    )
    .optional(),
  postalCode: Yup.string()
    .length(4, "Postal code must be 4 digits")
    .matches(/^[0-9]+$/, "Postal code must contain only digits")
    .optional(),
  nationality: Yup.string()
    .matches(/^[a-zA-Z]+$/, "Nationality must only contain letters")
    .optional(),
  address: Yup.string().optional(),
  governorate: Yup.string().optional(),
  city: Yup.string().optional(),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{8}$/, "Phone number must be exactly 8 digits")
    .optional(),
  transcript: Yup.mixed().nullable().optional(),
});

const StudentUpdateForm = ({ student, onSuccess, onCancel }) => {
  const handleSubmit = async (values, { setSubmitting }) => {
    const token = localStorage.getItem("token");
    const studentId = student._id;

    if (!token || !studentId) {
      Swal.fire(
        "Error",
        "Authentication token or student ID is missing.",
        "error"
      );
      setSubmitting(false);
      return;
    }

    const formData = new FormData();

    // Append all changed fields to FormData
    Object.entries(values).forEach(([key, value]) => {
      if (key === "transcript") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return;
      }

      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== initialValues[key]
      ) {
        formData.append(key, value);
      }
    });

    // If no fields changed (excluding transcript)
    if (formData.entries().next().done) {
      Swal.fire("No changes", "No data was modified.", "info");
      setSubmitting(false);
      return;
    }

    try {
      const response = await updateStudent(studentId, formData, token);

      if (response?.student?._id) {
        await Swal.fire("Updated", "Student updated successfully!", "success");
        onSuccess(); // Ceci déclenchera le rechargement
      } else {
        // Handle specific error messages
        const errorMessage = response?.message?.toLowerCase();
        if (errorMessage?.includes("aucune donnée à mettre à jour")) {
          Swal.fire("No changes", "No data was modified.", "info");
        } else {
          Swal.fire("Error", response?.message || "Update failed", "error");
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Set initial values based on the current student data
  const initialValues = {
    cin: student.cin || "",
    email: student.email || "",
    firstName: student.firstName || "",
    lastName: student.lastName || "",
    dateOfBirth: student.dateOfBirth || "",
    gender: student.gender || "",
    level: student.level || "",
    arabicName: student.arabicName || "",
    postalCode: student.postalCode || "",
    nationality: student.nationality || "",
    address: student.address || "",
    governorate: student.governorate || "",
    city: student.city || "",
    phoneNumber: student.phoneNumber || "",
    transcript: student.transcript || null,
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        p: 0,
        mb: 2,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" mb={4} textAlign="left" fontWeight="normal">
          Update Student
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            setFieldValue,
            errors,
            touched,
            handleBlur,
          }) => (
            <Form>
              <Grid container spacing={1.5}>
                {/* Basic Fields */}
                {[
                  { name: "cin", label: "CIN", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "firstName", label: "First Name", type: "text" },
                  { name: "lastName", label: "Last Name", type: "text" },
                  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                  { name: "arabicName", label: "Arabic Name", type: "text" },
                  { name: "postalCode", label: "Postal Code", type: "text" },
                  { name: "nationality", label: "Nationality", type: "text" },
                  { name: "address", label: "Address", type: "text" },
                  { name: "governorate", label: "Governorate", type: "text" },
                  { name: "city", label: "City", type: "text" },
                  { name: "phoneNumber", label: "Phone Number", type: "text" },
                ].map(({ name, label, type }) => (
                  <Grid item xs={12} key={name}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" mr="10px">
                          {label}:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          fullWidth
                          size="small"
                          name={name}
                          type={type}
                          value={values[name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched[name] && Boolean(errors[name])}
                          helperText={touched[name] && errors[name]}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#f9f9f9",
                              borderRadius: "4px",
                              border: "1px solid #f1f1f1",
                              height: "36px",
                              "&.Mui-focused fieldset": {
                                borderColor: "#d4e8e8 !important",
                                boxShadow: "0 0 0 2px rgba(237, 255, 255, 0.5)",
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}

                {/* Gender */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="40px">
                        Gender:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <FormControl component="fieldset" size="small">
                        <RadioGroup
                          row
                          name="gender"
                          value={values.gender}
                          onChange={handleChange}
                        >
                          <FormControlLabel
                            value="Male"
                            control={<Radio size="small" />}
                            label="Male"
                          />
                          <FormControlLabel
                            value="Female"
                            control={<Radio size="small" />}
                            label="Female"
                          />
                        </RadioGroup>
                        {touched.gender && errors.gender && (
                          <Typography color="error" variant="caption">
                            {errors.gender}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Transcript file upload */}
                <Grid item xs={12}>
                  <Typography variant="body2">Transcript </Typography>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      setFieldValue("transcript", file || null);
                    }}
                  />
                  {touched.transcript && errors.transcript && (
                    <Typography color="error" variant="caption">
                      {errors.transcript}
                    </Typography>
                  )}
                </Grid>

                {/* Buttons */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        borderColor: "#ccc",
                        color: "#333",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        px: 2,
                        py: 0.5,
                        fontSize: "0.875rem",
                        backgroundColor: "#4da3bdb6",
                        "&:hover": {
                          backgroundColor: "#4da3bdb6",
                        },
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default StudentUpdateForm;
