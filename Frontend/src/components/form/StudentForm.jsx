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
import { addStudent } from "services/student";

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
  dateOfBirth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .optional(),
  gender: Yup.string().oneOf(["Male", "Female"]).optional(),
  level: Yup.string().oneOf(["1", "2", "3"]).optional(),
});

const initialValues = {
  cin: "",
  email: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  level: "",
};

const StudentForm = ({ onSuccess, onCancel }) => {
  const handleSubmit = async (values, { resetForm }) => {
    console.log("Form values:", values);
    const token = localStorage.getItem("token");

    try {
      const response = await addStudent(values, token);

      // Vérification du champ 'student' dans la réponse pour détecter un ajout réussi
      if (response?.student?._id) {
        Swal.fire(
          "Ajouté avec succès",
          "Student added successfully!",
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
          Swal.fire("Échec de l'ajout", "Failed to add student", "error");
        }
      }
    } catch (error) {
      console.error("Error adding student:", error);
      Swal.fire("Erreur", "Something went wrong", "error");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 350,
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
          Add Student
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

                {/* Date of Birth Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2">Date of Birth:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        size="small"
                        name="dateOfBirth"
                        type="date"
                        value={values.dateOfBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.dateOfBirth && Boolean(errors.dateOfBirth)
                        }
                        helperText={touched.dateOfBirth && errors.dateOfBirth}
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

                {/* Level Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="50px">
                        Level:
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={touched.level && Boolean(errors.level)}
                      >
                        <Select
                          name="level"
                          value={values.level}
                          onChange={handleChange}
                          sx={{
                            backgroundColor: "#f9f9f9",
                            borderRadius: "4px",
                            border: "1px solid #f1f1f1",
                            height: "36px",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#d4e8e8 !important",
                              boxShadow: "0 0 0 2px rgba(237, 255, 255, 0.5)",
                            },
                          }}
                        >
                          <MenuItem value="1">1</MenuItem>
                          <MenuItem value="2">2</MenuItem>
                          <MenuItem value="3">3</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Gender Field */}
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" mr="36px">
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

export default StudentForm;
