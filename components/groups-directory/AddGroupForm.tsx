"use client";
import AdminGroupsDirectoryForm from "./AdminGroupsDirectoryForm";

interface FormProps {
  userName?: string;
  userEmail?: string;
}

const AddGroupForm = ({
  info,
  onClose,
}: {
  info: FormProps;
  onClose?: () => void;
}) => {
  return <AdminGroupsDirectoryForm mode="add" info={info} onClose={onClose} />;
};

export default AddGroupForm;
