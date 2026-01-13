import PuffLoader from "react-spinners/PuffLoader";

export default function LoadingComponent() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <PuffLoader color="#1d4ed8" />
    </div>
  );
}
