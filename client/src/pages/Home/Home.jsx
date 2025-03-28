import { MdAdd } from "react-icons/md";
import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import AddEditTask from "./AddEditTask";
import moment from "moment";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";

import addTaskImg from "../../assets/add-task.webp";
import noTasksImg from "../../assets/no-tasks.jpg";

const Home = () => {
  const [openEditModal, setOpenEditModal] = useState({
    isShow: false,
    type: "add",
    data: null,
  });

  const [showTosatMsg, setToastMsg] = useState({
    isShow: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (taskDetails) => {
    setOpenEditModal({ isShow: true, data: taskDetails, type: "edit" });
  };
  const showTosatMessage = (message, type) => {
    setToastMsg({
      isShow: true,
      message: message,
      type,
    });
  };

  const handleCloseToast = () => {
    setToastMsg({
      isShow: false,
      message: "",
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if ((error.response.status = 401)) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get("/task/get");
      if (response.data && response.data.tasks) {
        setAllTasks(response.data.tasks);
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.");
    }
  };

  const deleteTask = async (data) => {
    const taskId = data._id;

    try {
      const response = await axiosInstance.delete(`/task/delete/${taskId}`);
      if (response.data && !response.data.error) {
        showTosatMessage("Task Deleted Successfully", "delete");

        getAllTasks();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occured. Please try again.");
      }
    }
  };

  const togglePinTask = async (task) => {
    try {
      const response = await axiosInstance.put(`/task/update-pin/${task._id}`, {
        isPinned: !task.isPinned,
      });

      if (response.data && !response.data.error) {
        showTosatMessage(
          `Task ${task.isPinned ? "Unpinned" : "Pinned"} Successfully`,
          "update"
        );

        getAllTasks();
      }
    } catch (error) {
      console.log("An error occurred while updating the pin status.");
    }
  };

  const onSearch = async (query) => {
    if (!query.trim()) {
      setIsSearch(false);
      getAllTasks();
      return;
    }

    try {
      const response = await axiosInstance.get("/search-tasks", {
        params: { query },
      });

      if (response.data && response.data.tasks) {
        setIsSearch(true);
        setAllTasks(response.data.tasks);
      } else {
        setIsSearch(true);
        setAllTasks([]);
      }
    } catch (error) {
      console.log("Search error:", error);
    }
  };

  useEffect(() => {
    getAllTasks();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearch={onSearch}
        getAllTasks={getAllTasks}
      />

      <div className="container mx-auto">
        {allTasks.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allTasks.map((item, index) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={
                  item.createdOn
                    ? moment(item.createdOn).toISOString().split("T")[0]
                    : "Invalid Date"
                }
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteTask(item)}
                onPinNote={() => togglePinTask(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? noTasksImg : addTaskImg}
            message={
              isSearch
                ? "No tasks found!"
                : "Start creating your first task! Click the 'Add' button."
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2B85FF] hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenEditModal({ isShow: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openEditModal.isShow}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 "
      >
        <AddEditTask
          type={openEditModal.type}
          taskData={openEditModal.data}
          onClose={() => {
            setOpenEditModal({ isShow: false, type: "add", data: null });
          }}
          getAllTasks={getAllTasks}
          showTosatMessage={showTosatMessage}
        />
      </Modal>
      <Toast
        isShow={showTosatMsg.isShow}
        message={showTosatMsg.message}
        type={showTosatMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};
export default Home;
