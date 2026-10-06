import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { MediaDisplay, mediaUrl, rowsFrom, selectClassName, submitAdminResource } from "../../utils/adminForm";

export default function PlanCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [courses, setCourses] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    en_title: "",
    description: "",
    unit_price: 0,
    discount: 0,
    discount_type: "flat",
    is_active: true,
    course_ids: [] as number[],
    unit_ids: [] as number[],
    image: null as MediaDisplay | null,
    video: null as MediaDisplay | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ApiRequest.call("api/admin/courses", "GET").then((response) => setCourses(rowsFrom(response, "courses")));
    if (isUpdateMode) {
      ApiRequest.call("api/admin/plans/" + id, "GET").then((response) => {
        const data = response.data.plan;
        setForm({
          title: data.title ?? "",
          en_title: data.en_title ?? "",
          description: data.description ?? "",
          unit_price: data.unit_price ?? 0,
          discount: data.discount ?? 0,
          discount_type: data.discount_type ?? "flat",
          is_active: Boolean(Number(data.is_active)),
          course_ids: (data.courses || []).map((item: any) => item.id),
          unit_ids: (data.units || []).map((item: any) => item.id),
          image: data.image ?? null,
          video: data.video ?? null,
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  useEffect(() => {
    if (form.course_ids.length === 0) {
      setUnits([]);
      return;
    }
    Promise.all(form.course_ids.map((courseId) => ApiRequest.call(`api/admin/courses/${courseId}/units`, "GET"))).then(
      (responses) => {
        const allUnits = responses.flatMap((response) => rowsFrom(response, "units"));
        setUnits(allUnits);
      }
    );
  }, [form.course_ids.join(",")]);

  const toggleId = (field: "course_ids" | "unit_ids", value: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.en_title) {
      ToastrNotification.error("عنوان فارسی و انگلیسی الزامی است");
      return;
    }
    if (form.course_ids.length === 0 && form.unit_ids.length === 0) {
      ToastrNotification.error("حداقل یک دوره یا یک درس باید انتخاب شود");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile || videoFile);
      const payload: Record<string, any> = {
        title: form.title,
        en_title: form.en_title,
        description: form.description,
        unit_price: form.unit_price,
        discount: form.discount,
        discount_type: form.discount_type,
        is_active: form.is_active ? 1 : 0,
      };
      if (hasFiles) {
        payload["course_ids[]"] = form.course_ids;
        payload["unit_ids[]"] = form.unit_ids;
      } else {
        payload.course_ids = form.course_ids;
        payload.unit_ids = form.unit_ids;
      }
      if (imageFile) payload.image = imageFile;
      if (videoFile) payload.video = videoFile;
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/plans/" + id : "api/admin/plans",
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.planIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره پلن");
    } catch (error) {
      console.log("error in PlanCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : mediaUrl(form.image)),
    [imageFile, form.image]
  );
  const currentVideoUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : form.video?.url || ""),
    [videoFile, form.video]
  );

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش پلن" : "ایجاد پلن"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش پلن" : "ایجاد پلن"} />
      <ComponentCard title="اطلاعات پلن">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>عنوان انگلیسی</Label>
            <Input value={form.en_title} onChange={(e) => setForm({ ...form, en_title: e.target.value })} />
          </div>
          <div>
            <Label>قیمت</Label>
            <Input type="text" numberFormat value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>تخفیف</Label>
            <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>نوع تخفیف</Label>
            <select className={selectClassName} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
              <option value="flat">مبلغی</option>
              <option value="percentage">درصدی</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>توضیحات</Label>
            <TextArea rows={5} value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          </div>
          <div className="md:col-span-2">
            <Label>دوره‌ها</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              {courses.map((item) => (
                <Checkbox key={item.id} label={item.title} checked={form.course_ids.includes(item.id)} onChange={() => toggleId("course_ids", item.id)} />
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Label>دروس</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              {units.map((item) => (
                <Checkbox key={item.id} label={item.title} checked={form.unit_ids.includes(item.id)} onChange={() => toggleId("unit_ids", item.id)} />
              ))}
            </div>
          </div>
          <div>
            <Label>تصویر</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-20 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label>ویدیو</Label>
            {currentVideoUrl && <video src={currentVideoUrl} className="mb-3 h-20 w-32 rounded-lg object-cover" controls />}
            <FileInput accept="video/mp4,video/mpeg,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="پلن فعال است"
                  defaultChecked={form.is_active}
                  onChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="success" size="md" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
