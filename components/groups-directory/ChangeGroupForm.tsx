"use client";
import AdminGroupsDirectoryForm from "./AdminGroupsDirectoryForm";

interface FormProps {
  name: string;
  categories: string;
  description: string;
  link?: string;
  userName?: string;
  userEmail?: string;
}

const ChangeGroupForm = ({
  info,
  onClose,
}: {
  info: FormProps;
  onClose?: () => void;
}) => {
  return <AdminGroupsDirectoryForm mode="edit" info={info} onClose={onClose} />;
};

export default ChangeGroupForm;
