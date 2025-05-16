import React, { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile } from "services/student";
import Loader from "components/Loader/Loader";
import Swal from "sweetalert2";
import { FaUser, FaCamera } from "react-icons/fa";
import "./StudentProfile.scss";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    address: "",
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const API_BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getMyProfile(token);

        setProfile(data);
        setFormData({
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          photo: null,
        });

        if (data.photo) {
          const photoUrl = data.photo.startsWith("http")
            ? data.photo
            : `${API_BASE_URL}/${data.photo.replace(/\\/g, "/")}`;
          setPhotoPreview(photoUrl);
        } else {
          setPhotoPreview(null);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to load profile",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: "File too large",
          text: "Please select an image smaller than 2MB",
          icon: "error",
        });
        return;
      }

      if (!file.type.match("image.*")) {
        Swal.fire({
          title: "Invalid file type",
          text: "Please select an image file (JPEG, PNG)",
          icon: "error",
        });
        return;
      }

      setFormData({
        ...formData,
        photo: file,
      });

      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const hasChanges = () => {
    if (!profile) return false;

    return (
      formData.email !== profile.email ||
      formData.phoneNumber !== profile.phoneNumber ||
      formData.address !== profile.address ||
      (formData.photo !== null && formData.photo instanceof File)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      Swal.fire({
        title: "No Changes",
        text: "You haven't made any changes to save.",
        icon: "info",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);

      if (formData.photo instanceof File) {
        formDataToSend.append("photo", formData.photo);
      }

      const updatedProfile = await updateMyProfile(formDataToSend, token);

      // Update profile state with the full response to ensure all fields are synchronized
      setProfile({
        ...profile, // Preserve fields like firstName, lastName
        email: updatedProfile.email || formData.email,
        phoneNumber: updatedProfile.phoneNumber || formData.phoneNumber,
        address: updatedProfile.address || formData.address,
        photo:
          updatedProfile.photo ||
          (formData.photo ? formData.photo : profile.photo),
      });

      // Reset formData to match the updated profile
      setFormData({
        email: updatedProfile.email || formData.email,
        phoneNumber: updatedProfile.phoneNumber || formData.phoneNumber,
        address: updatedProfile.address || formData.address,
        photo: null,
      });

      // Update photo preview with the new photo URL from the server
      if (updatedProfile.photo) {
        const photoUrl = updatedProfile.photo.startsWith("http")
          ? updatedProfile.photo
          : `${API_BASE_URL}/${updatedProfile.photo.replace(/\\/g, "/")}`;
        setPhotoPreview(photoUrl);
      } else if (formData.photo instanceof File) {
        // Fallback to the locally selected photo if server doesn't return a new photo
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(formData.photo);
      } else {
        setPhotoPreview(null);
      }

      setEditMode(false);
      setSelectedFileName("");

      Swal.fire({
        title: "Success",
        text: "Profile updated successfully!",
        icon: "success",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = "Failed to update profile";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedFileName("");
    if (profile) {
      setFormData({
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
        photo: null,
      });
      setPhotoPreview(
        profile.photo
          ? profile.photo.startsWith("http")
            ? profile.photo
            : `${API_BASE_URL}/${profile.photo.replace(/\\/g, "/")}`
          : null
      );
    }
    setErrors({});
  };

  if (loading) return <Loader />;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="student-profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          {!editMode ? (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!hasChanges()}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="profile-body">
          <div className="photo-section">
            <div className="photo-container">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="profile-photo"
                />
              ) : (
                <div className="default-photo">
                  <FaUser size={64} />
                </div>
              )}
            </div>

            {editMode && (
              <div className="photo-upload-container">
                <div className="photo-upload">
                  <label htmlFor="photo-upload" className="btn btn-outline">
                    <FaCamera /> {photoPreview ? "Change Photo" : "Add Photo"}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
                {selectedFileName && (
                  <div className="file-name">{selectedFileName}</div>
                )}
              </div>
            )}
          </div>

          <div className="info-section">
            {editMode ? (
              <form className="profile-form">
                <div className="form-group">
                  <label>First Name</label>
                  <div className="read-only-field">{profile.firstName}</div>
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <div className="read-only-field">{profile.lastName}</div>
                </div>

                <div
                  className={`form-group ${errors.email ? "has-error" : ""}`}
                >
                  <label>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                <div
                  className={`form-group ${errors.phoneNumber ? "has-error" : ""}`}
                >
                  <label>Phone Number*</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <div className="error-message">{errors.phoneNumber}</div>
                  )}
                </div>

                <div
                  className={`form-group ${errors.address ? "has-error" : ""}`}
                >
                  <label>Address*</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter your address"
                  />
                  {errors.address && (
                    <div className="error-message">{errors.address}</div>
                  )}
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">First Name:</span>
                  <span className="detail-value">{profile.firstName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Name:</span>
                  <span className="detail-value">{profile.lastName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{profile.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">
                    {profile.phoneNumber || (
                      <span className="empty-value">Not specified</span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">
                    {profile.address || (
                      <span className="empty-value">Not specified</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
