import React from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { updateTeacher } from "services/teacher";

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
  grade: Yup.string().optional(),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{8}$/, "Phone number must be exactly 8 digits")
    .optional(),
});

const TeacherUpdateForm = ({ teacher, onSuccess, onCancel }) => {
  const initialValues = {
    cin: teacher.cin || "",
    email: teacher.email || "",
    firstName: teacher.firstName || "",
    lastName: teacher.lastName || "",
    grade: teacher.grade || "",
    phoneNumber: teacher.phoneNumber || "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const token = localStorage.getItem("token");
    const teacherId = teacher._id;

    if (!token || !teacherId) {
      Swal.fire("Error", "Authentication token or ID is missing.", "error");
      setSubmitting(false);
      return;
    }

    try {
      // Créer un objet simple au lieu de FormData
      const updateData = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValues[key]) {
          updateData[key] = values[key];
        }
      });

      const response = await updateTeacher(teacherId, updateData, token);

      if (response && (response.teacher || response.message)) {
        await Swal.fire(
          "Success",
          response.message || "Teacher updated successfully!",
          "success"
        );
        onSuccess(); // Ceci déclenchera le rechargement
      } else {
        Swal.fire("Error", "No valid response from server", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update teacher",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 350,
        mx: "auto",
        p: 2,
        mb: 2,
        bgcolor: "white",
        borderRadius: "8px",
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" mb={4} textAlign="left" fontWeight="normal">
        Update Teacher
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          handleChange,
          errors,
          touched,
          handleBlur,
          isSubmitting,
        }) => (
          <Form>
            <Grid container spacing={1.5}>
              {[
                { name: "cin", label: "CIN", type: "text" },
                { name: "email", label: "Email", type: "email" },
                { name: "firstName", label: "First Name", type: "text" },
                { name: "lastName", label: "Last Name", type: "text" },
                { name: "grade", label: "Grade", type: "text" },
                { name: "phoneNumber", label: "Phone Number", type: "text" },
              ].map(({ name, label, type }) => (
                <Grid item xs={12} key={name}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2">{label}:</Typography>
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
                            bgcolor: "#f9f9f9",
                            borderRadius: "4px",
                            "&.Mui-focused fieldset": {
                              borderColor: "#4da3bd !important",
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    sx={{ borderRadius: "20px", textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      bgcolor: "#4da3bd",
                      "&:hover": { bgcolor: "#3a92a8" },
                    }}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default TeacherUpdateForm;
