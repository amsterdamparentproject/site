"use client";
import { EditFormInfo } from "@/app/types/groups-directory";
import AdminGroupsDirectoryForm from "./AdminGroupsDirectoryForm";

const ChangeGroupForm = ({
  info,
  onClose,
}: {
  info: EditFormInfo;
  onClose?: () => void;
}) => {
  return <AdminGroupsDirectoryForm mode="edit" info={info} onClose={onClose} />;
};

export default ChangeGroupForm;
