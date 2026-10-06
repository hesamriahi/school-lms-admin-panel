import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Button from "../../components/ui/button/Button";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";

type MediaDisplay = {
  id?: number;
  url?: string;
  conversions?: { sm?: string; md?: string; lg?: string };
};

function mediaUrl(media?: MediaDisplay | null) {
  return media?.conversions?.sm || media?.url || "";
}

export default function StudentCommentCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = id ? true : false;
  const navigate = useNavigate();
  const [comment, setComment] = useState({
    name: "",
    comment: "",
    student_job: "",
    rate: 5,
    priority: 1,
    image: null as MediaDisplay | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call("api/admin/student-comments/" + id, "GET").then((response) => {
        const data = response.data.studentComment;
        setComment({
          name: data.name ?? "",
          comment: data.comment ?? "",
          student_job: data.student_job ?? "",
          rate: data.rate ?? 5,
          priority: data.priority ?? 1,
          image: data.image ?? null,
        });
      });
    }
  }, [isUpdateMode]);

  const handleSubmit = async () => {
    if (!comment.name) {
      ToastrNotification.error("نام هنرجو را وارد کنید");
      return;
    }
    if (!comment.comment) {
      ToastrNotification.error("متن نظر را وارد کنید");
      return;
    }
    if (comment.rate < 0 || comment.rate > 5) {
      ToastrNotification.error("امتیاز باید بین ۰ تا ۵ باشد");
      return;
    }
    if (!isUpdateMode && !imageFile) {
      ToastrNotification.error("تصویر هنرجو الزامی است");
      return;
    }

    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile);
      const payload: Record<string, any> = {
        name: comment.name,
        comment: comment.comment,
        student_job: comment.student_job,
        rate: comment.rate,
        priority: comment.priority,
      };

      if (imageFile) payload.image = imageFile;
      if (isUpdateMode && hasFiles) payload._method = "PUT";

      const response: ApiResponse = await ApiRequest.call(
        isUpdateMode ? "api/admin/student-comments/" + id : "api/admin/student-comments",
        isUpdateMode && !hasFiles ? "PUT" : "POST",
        payload,
        null,
        true,
        true,
        hasFiles
      );

      if (response.success) {
        navigate(ROUTES.studentCommentIndex);
      } else {
        ToastrNotification.error(response.message || "خطا در ذخیره نظر");
      }
    } catch (error) {
      console.log("error in StudentCommentCreateEdit. on sending message. error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : mediaUrl(comment.image)),
    [imageFile, comment.image]
  );

  useEffect(() => {
    return () => {
      if (imageFile && currentImageUrl.startsWith("blob:")) URL.revokeObjectURL(currentImageUrl);
    };
  }, [imageFile, currentImageUrl]);

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش نظر هنرجو" : "ایجاد نظر هنرجو"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش نظر هنرجو" : "ایجاد نظر هنرجو"} />
      <ComponentCard title="اطلاعات نظر هنرجو">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="comment.name">نام هنرجو</Label>
            <Input
              type="text"
              id="comment.name"
              name="comment.name"
              placeholder="نام هنرجو را وارد کنید"
              value={comment.name}
              onChange={(e) => setComment({ ...comment, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="comment.student_job">شغل</Label>
            <Input
              type="text"
              id="comment.student_job"
              name="comment.student_job"
              placeholder="شغل هنرجو را وارد کنید"
              value={comment.student_job}
              onChange={(e) => setComment({ ...comment, student_job: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="comment.rate">امتیاز (۰ تا ۵)</Label>
            <Input
              type="number"
              id="comment.rate"
              name="comment.rate"
              placeholder="مثلا 4.5"
              min="0"
              max="5"
              step={0.1}
              value={comment.rate}
              onChange={(e) => setComment({ ...comment, rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="comment.priority">اولویت</Label>
            <Input
              type="number"
              id="comment.priority"
              name="comment.priority"
              placeholder="اولویت نمایش"
              value={comment.priority}
              onChange={(e) => setComment({ ...comment, priority: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="comment.comment">نظر</Label>
            <TextArea
              placeholder="متن نظر هنرجو را وارد کنید"
              rows={6}
              value={comment.comment}
              onChange={(value) => setComment({ ...comment, comment: value })}
            />
          </div>
          <div>
            <Label htmlFor="comment.image">{isUpdateMode ? "تصویر (اختیاری)" : "تصویر"}</Label>
            {currentImageUrl && (
              <img src={currentImageUrl} alt={comment.name} className="mb-3 h-20 w-20 rounded-lg object-cover" />
            )}
            <FileInput
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-gray-400">jpeg، png، jpg یا webp — حداکثر ۱ مگابایت</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="success" size="md" onClick={handleSubmit} disabled={isSubmitting} type="button">
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
