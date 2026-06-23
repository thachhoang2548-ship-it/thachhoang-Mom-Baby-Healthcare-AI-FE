export const SubmitCard = ({ loading, onSubmit }) => {
return (
<div className="mt-8 flex justify-center">
    <button
      disabled={loading}
      onClick={onSubmit}
      className={`flex items-center justify-center whitespace-nowrap rounded-lg h-12 px-6 text-base font-bold bg-primary text-black hover:brightness-95 ${loading ? "opacity-60" : ""}`}
    >
      {loading ? "Đang lưu..." : "Lưu nhật ký hôm nay"}
    </button>
</div>
);
};