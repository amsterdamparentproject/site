"use client";
import { AddFormInfo } from "@/app/types/groups-directory";
import AdminGroupsDirectoryForm from "./AdminGroupsDirectoryForm";

const AddGroupForm = ({
  info,
  onClose,
}: {
  info: AddFormInfo;
  onClose?: () => void;
}) => {
  return <AdminGroupsDirectoryForm mode="add" info={info} onClose={onClose} />;
};

export default AddGroupForm;
