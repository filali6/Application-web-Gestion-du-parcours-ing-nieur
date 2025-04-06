import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { addTeacher } from "services/teacher";

const validationSchema = Yup.object().shape({
  cin: Yup.string()
    .matches(/^\d{8}$/, "CIN must be exactly 8 digits")
    .required("CIN is required"),
  email: Yup.string()
    .email("Invalid email address")
    .matches(
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Invalid email format"
    )
    .required("Email is required"),
  firstName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "First name must only contain letters")
    .required("First name is required"),
  lastName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "Last name must only contain letters")
    .required("Last name is required"),
});

const initialValues = {
  cin: "",
  email: "",
  firstName: "",
  lastName: "",
};

const TeacherForm = ({ onSuccess, onCancel }) => {
  const handleSubmit = async (values, { resetForm }) => {
    console.log("Form values:", values);
    const token = localStorage.getItem("token");

    try {
      const response = await addTeacher(values, token);

      // Vérification du champ 'teacher' dans la réponse pour détecter un ajout réussi
      if (response?.teacher?._id) {
        await Swal.fire(
          "Ajouté avec succès",
          "Teacher added successfully!",
          "success"
        );
        resetForm();
        onSuccess();
      } else {
        // Traitement des messages d'erreur basés sur la réponse du backend
        const errorMessage = response?.message?.toLowerCase();
        if (errorMessage?.includes("le cin existe déjà")) {
          Swal.fire("CIN déjà existant", "CIN already exists.", "error");
        } else if (errorMessage?.includes("l'email existe déjà")) {
          Swal.fire("Email déjà existant", "Email already exists.", "error");
        } else {
          Swal.fire("Échec de l'ajout", "Failed to add teacher", "error");
        }
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      Swal.fire("Erreur", "Something went wrong", "error");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 380,
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
          Add Teacher
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, errors, touched, handleBlur }) => (
            <Form>
              <Grid container spacing={1.5}>
                {/* CIN Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="50px">
                        CIN:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        name="cin"
                        type="text"
                        value={values.cin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.cin && Boolean(errors.cin)}
                        helperText={touched.cin && errors.cin}
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

                {/* Email Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="40px">
                        Email:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
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

                {/* First Name Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="10px">
                        First Name:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        name="firstName"
                        type="text"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
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

                {/* Last Name Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="10px">
                        Last Name:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        name="lastName"
                        type="text"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
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
                      Confirm
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

export default TeacherForm;
