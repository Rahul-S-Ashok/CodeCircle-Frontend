import React, { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  // FORM STATE
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");

  const [skillsInput, setSkillsInput] = useState(
    Array.isArray(user.skills) ? user.skills.join(", ") : ""
  );

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const saveProfile = async () => {
    setError("");
    try {
      const skillsArray = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
          skills: skillsArray,
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.data));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* PAGE CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-10">
          Edit Your Profile
        </h1>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
          {/* LEFT: FORM */}
          <div className="w-full lg:w-[420px]">
            <div className="card bg-base-300 shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center mb-4">
                  Profile Details
                </h2>

                <label className="form-control w-full my-2">
                  <span className="label-text">First Name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">Last Name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">Age</span>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">Photo URL</span>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">Gender</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Others</option>
                  </select>
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">Skills</span>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Node, MongoDB"
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full my-2">
                  <span className="label-text">About</span>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="textarea textarea-bordered w-full"
                  />
                </label>

                {error && (
                  <p className="text-red-500 text-center mt-2">{error}</p>
                )}

                <button
                  className="btn bg-purple-600 hover:bg-purple-700 text-white w-full mt-4"
                  onClick={saveProfile}
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="w-full lg:w-[360px] flex justify-center">
            <UserCard
              user={{
                _id: user._id,
                firstName,
                lastName,
                photoUrl,
                about,
                age,
                gender,
                skills: skillsInput
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              }}
              showActions={false}
            />
          </div>
        </div>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="toast toast-top toast-center pt-20 z-50">
          <div className="alert alert-success">
            <span>Profile saved successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
