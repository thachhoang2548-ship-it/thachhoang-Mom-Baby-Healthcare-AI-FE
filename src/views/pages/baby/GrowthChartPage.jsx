import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import { useProfileController } from '../../../controllers/profileController';
import { formatBabyDisplayName, pickPreferredBaby, useBabyTheme } from '../../../hooks/useBabyTheme';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  ArrowLeft,
  Scale,
  ArrowUpRight,
  Activity,
  ShieldAlert,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  ChevronRight,
  Info,
  Loader2,
  Baby
} from 'lucide-react';
import toast from 'react-hot-toast';

// WHO standard weight percentile values (Boys in kg)
const WHO_WEIGHT_BOYS = [
  { month: 0, P3: 2.5, P15: 2.9, P50: 3.3, P85: 3.9, P97: 4.4 },
  { month: 2, P3: 4.3, P15: 4.9, P50: 5.6, P85: 6.3, P97: 7.1 },
  { month: 4, P3: 5.6, P15: 6.2, P50: 7.0, P85: 7.8, P97: 8.6 },
  { month: 6, P3: 6.4, P15: 7.1, P50: 7.9, P85: 8.8, P97: 9.7 },
  { month: 8, P3: 7.0, P15: 7.8, P50: 8.6, P85: 9.6, P97: 10.5 },
  { month: 10, P3: 7.5, P15: 8.3, P50: 9.2, P85: 10.2, P97: 11.2 },
  { month: 12, P3: 7.8, P15: 8.7, P50: 9.6, P85: 10.7, P97: 11.8 },
  { month: 15, P3: 8.4, P15: 9.3, P50: 10.3, P85: 11.5, P97: 12.7 },
  { month: 18, P3: 8.9, P15: 9.9, P50: 10.9, P85: 12.2, P97: 13.5 },
  { month: 21, P3: 9.4, P15: 10.4, P50: 11.5, P85: 12.9, P97: 14.3 },
  { month: 24, P3: 9.8, P15: 10.9, P50: 12.0, P85: 13.5, P97: 15.0 }
];

// WHO standard weight percentile values (Girls in kg)
const WHO_WEIGHT_GIRLS = [
  { month: 0, P3: 2.4, P15: 2.8, P50: 3.2, P85: 3.8, P97: 4.2 },
  { month: 2, P3: 3.9, P15: 4.5, P50: 5.1, P85: 5.8, P97: 6.6 },
  { month: 4, P3: 5.0, P15: 5.7, P50: 6.4, P85: 7.3, P97: 8.2 },
  { month: 6, P3: 5.8, P15: 6.5, P50: 7.3, P85: 8.2, P97: 9.3 },
  { month: 8, P3: 6.3, P15: 7.0, P50: 7.9, P85: 9.0, P97: 10.2 },
  { month: 10, P3: 6.8, P15: 7.5, P50: 8.5, P85: 9.6, P97: 10.9 },
  { month: 12, P3: 7.1, P15: 7.9, P50: 8.9, P85: 10.1, P97: 11.5 },
  { month: 15, P3: 7.7, P15: 8.5, P50: 9.6, P85: 10.9, P97: 12.4 },
  { month: 18, P3: 8.2, P15: 9.1, P50: 10.2, P85: 11.6, P97: 13.2 },
  { month: 21, P3: 8.6, P15: 9.6, P50: 10.8, P85: 12.3, P97: 14.0 },
  { month: 24, P3: 9.0, P15: 10.1, P50: 11.4, P85: 13.0, P97: 14.8 }
];

// WHO standard height percentile values (Boys in cm)
const WHO_HEIGHT_BOYS = [
  { month: 0, P3: 46.3, P15: 48.0, P50: 49.9, P85: 51.8, P97: 53.4 },
  { month: 2, P3: 54.4, P15: 56.4, P50: 58.4, P85: 60.4, P97: 62.4 },
  { month: 4, P3: 59.7, P15: 61.8, P50: 63.9, P85: 66.0, P97: 68.0 },
  { month: 6, P3: 63.6, P15: 65.7, P50: 67.9, P85: 70.1, P97: 72.2 },
  { month: 8, P3: 66.8, P15: 69.0, P50: 71.2, P85: 73.5, P97: 75.6 },
  { month: 10, P3: 69.6, P15: 71.8, P50: 74.1, P85: 76.4, P97: 78.6 },
  { month: 12, P3: 71.9, P15: 74.2, P50: 76.5, P85: 78.9, P97: 81.1 },
  { month: 15, P3: 75.0, P15: 77.4, P50: 79.9, P85: 82.4, P97: 84.7 },
  { month: 18, P3: 77.8, P15: 80.4, P50: 83.0, P85: 85.6, P97: 88.0 },
  { month: 21, P3: 80.5, P15: 83.1, P50: 85.9, P85: 88.6, P97: 91.2 },
  { month: 24, P3: 82.9, P15: 85.7, P50: 88.6, P85: 91.4, P97: 94.1 }
];

// WHO standard height percentile values (Girls in cm)
const WHO_HEIGHT_GIRLS = [
  { month: 0, P3: 45.6, P15: 47.3, P50: 49.1, P85: 51.0, P97: 52.7 },
  { month: 2, P3: 53.2, P15: 55.0, P50: 57.1, P85: 59.1, P97: 60.9 },
  { month: 4, P3: 58.0, P15: 60.0, P50: 62.1, P85: 64.2, P97: 66.2 },
  { month: 6, P3: 61.5, P15: 63.5, P50: 65.7, P85: 67.9, P97: 69.9 },
  { month: 8, P3: 64.5, P15: 66.6, P50: 68.8, P85: 71.1, P97: 73.2 },
  { month: 10, P3: 67.0, P15: 69.2, P50: 71.5, P85: 73.9, P97: 76.1 },
  { month: 12, P3: 69.2, P15: 71.4, P50: 73.7, P85: 76.1, P97: 78.4 },
  { month: 15, P3: 72.2, P15: 74.5, P50: 77.0, P85: 79.5, P97: 81.8 },
  { month: 18, P3: 74.9, P15: 77.4, P50: 80.0, P85: 82.6, P97: 85.0 },
  { month: 21, P3: 77.5, P15: 80.1, P50: 82.7, P85: 85.4, P97: 88.0 },
  { month: 24, P3: 79.8, P15: 82.5, P50: 85.2, P85: 88.0, P97: 90.7 }
];

// Component Tooltip khai báo ngoài render để tránh tạo lại component mỗi lần vẽ (quy tắc React hooks)
function GrowthChartTooltip({ active, payload, label, unitSymbol }) {
  if (active && payload && payload.length) {
    const babyVal = payload.find((p) => p.dataKey === 'userValue')?.value;
    const p50Val = payload.find((p) => p.dataKey === 'P50')?.value;
    const difference = babyVal !== undefined && p50Val !== undefined ? (babyVal - p50Val).toFixed(1) : null;

    return (
      <div className="bg-theme-surface p-3.5 border border-theme-line rounded-2xl shadow-lg text-xs font-semibold text-theme-ink">
        <p className="font-bold text-theme-ink border-b border-theme-line pb-1.5 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-theme-brand shrink-0" aria-hidden="true" />
          <span>{label === 0 ? 'Sơ sinh (0 tháng)' : `${label} tháng tuổi`}</span>
        </p>
        <div className="space-y-1">
          {babyVal !== undefined && (
            <p className="flex justify-between items-center gap-6">
              <span>Bé của bạn:</span>
              <span className="font-bold text-theme-brand">
                {babyVal} {unitSymbol}
              </span>
            </p>
          )}
          {p50Val !== undefined && (
            <p className="flex justify-between items-center gap-6 text-theme-muted">
              <span>Chuẩn WHO P50:</span>
              <span className="font-bold text-theme-ink">
                {p50Val} {unitSymbol}
              </span>
            </p>
          )}
          {difference !== null && (
            <p className="flex justify-between items-center gap-6 text-xs border-t border-dashed border-theme-line pt-1.5 mt-1 font-bold">
              <span>Độ lệch chuẩn:</span>
              <span className={parseFloat(difference) >= 0 ? 'text-status-ok' : 'text-status-warn-text'}>
                {parseFloat(difference) > 0 ? `+${difference}` : difference} {unitSymbol}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function GrowthChartPage() {
  const navigate = useNavigate();
  const { momProfile, updateProfile } = useProfileController();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  // Growth logs
  const [weightLogs, setWeightLogs] = useState([]);

  // Active chart tab: 'weight' | 'height'
  const [activeTab, setActiveTab] = useState('weight');

  // Input form state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [logType, setLogType] = useState('today'); // 'today' | 'history'
  const [submitting, setSubmitting] = useState(false);

  // Baby creation wizard state
  const [setupMode, setSetupMode] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [babyGender, setBabyGender] = useState('boy');
  // Không điền sẵn ngày hôm nay: nếu người dùng quên sửa, bé bị lưu là 0 tháng tuổi
  // và BE từ chối sinh thực đơn ăn dặm (BABY_TOO_YOUNG_FOR_WEANING).
  const [birthDate, setBirthDate] = useState('');
  const [birthWeight, setBirthWeight] = useState('3.2');
  const [birthHeight, setBirthHeight] = useState('50');

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm (loading, setupMode)
  // Khi ở setupMode, truyền giới tính đang chọn để giao diện đổi màu theo bé trai / bé gái
  useBabyTheme(selectedBaby || (setupMode ? { gender: babyGender } : null));

  const parseAndSetLogs = useCallback((baby) => {
    let logs = [];
    if (baby.growthRecords && baby.growthRecords.length > 0) {
      logs = baby.growthRecords.map((g) => {
        const birth = new Date(baby.birthDate);
        const record = new Date(g.recordedAt);
        // Calendar month calculation to eliminate floating point rounding error
        const diffMonths = Math.max(
          0,
          (record.getFullYear() - birth.getFullYear()) * 12 + (record.getMonth() - birth.getMonth())
        );
        return {
          id: g.id,
          month: diffMonths,
          weight: g.weightKg,
          height: g.heightCm,
          recordedAt: g.recordedAt
        };
      });
    }

    // Chỉ vẽ các lần đo thật. Trước kia tự thêm điểm "tháng 0" lấy cân nặng hiện tại
    // (hoặc 3.2 kg / 50 cm) đặt vào lúc sinh, làm sai biểu đồ.
    setWeightLogs(logs.sort((a, b) => a.month - b.month));
  }, []);

  const loadBabies = useCallback(async (preferredBabyId = null) => {
    setLoading(true);
    try {
      const res = await babyService.getProfiles();
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful && res.data && res.data.length > 0) {
        setBabies(res.data);
        const targetId = preferredBabyId;
        const defaultBaby = targetId
          ? res.data.find((b) => b.id === targetId) || pickPreferredBaby(res.data)
          : pickPreferredBaby(res.data);
        setSelectedBaby(defaultBaby);
        parseAndSetLogs(defaultBaby);
      } else {
        setSetupMode(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải hồ sơ bé');
    } finally {
      setLoading(false);
    }
  }, [parseAndSetLogs]);

  useEffect(() => {
    loadBabies();
  }, [loadBabies]);

  useEffect(() => {
    if (
      momProfile &&
      (momProfile.stage === 2 || momProfile.stage === 'Postpartum' || momProfile.journeyStage === 'Postpartum') &&
      momProfile.deliveryDate
    ) {
      try {
        const dateStr = new Date(momProfile.deliveryDate).toISOString().substring(0, 10);
        setBirthDate(dateStr);
      } catch (e) {
        console.error('Error pre-filling birth date:', e);
      }
    }
  }, [momProfile]);

  // Suggest current age in months when selectedBaby changes
  useEffect(() => {
    if (selectedBaby) {
      const birth = new Date(selectedBaby.birthDate);
      const today = new Date();
      const diffMonths = Math.max(
        0,
        (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
      );
      setAgeMonths(Math.min(24, diffMonths).toString());
    }
  }, [selectedBaby, logType]);

  const handleSelectBaby = (baby) => {
    setSelectedBaby(baby);
    parseAndSetLogs(baby);
  };

  const handleCreateBaby = async (e) => {
    e.preventDefault();
    if (!babyName.trim()) {
      toast.error('Vui lòng nhập tên bé');
      return;
    }
    if (!birthDate) {
      toast.error('Vui lòng chọn ngày sinh của bé');
      return;
    }
    if (new Date(birthDate) > new Date()) {
      toast.error('Ngày sinh không thể là ngày trong tương lai');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: babyName.trim(),
        gender: babyGender === 'boy' ? 0 : 1,
        birthDate: new Date(birthDate).toISOString(),
        birthWeightKg: parseFloat(birthWeight),
        birthHeightCm: parseFloat(birthHeight),
        currentWeightKg: parseFloat(birthWeight),
        currentHeightCm: parseFloat(birthHeight)
      };

      const res = await babyService.createProfile(payload);
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful) {
        try {
          await updateProfile({
            ...momProfile,
            stage: 2,
            deliveryDate: payload.birthDate
          });
        } catch (stageErr) {
          console.warn('Error auto-updating mom stage to postpartum:', stageErr);
        }

        toast.success('Thiết lập hồ sơ bé thành công!');
        setSetupMode(false);
        await loadBabies();
      } else {
        toast.error(res?.message || 'Không thể tạo hồ sơ bé');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi thiết lập bé');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogGrowth = async (e) => {
    e.preventDefault();
    if (!weight || !height || !ageMonths) {
      toast.error('Vui lòng điền đầy đủ các trường');
      return;
    }

    const monthValue = parseInt(ageMonths, 10);
    if (isNaN(monthValue) || monthValue < 0 || monthValue > 24) {
      toast.error('Tháng tuổi hợp lệ từ 0 đến 24 tháng');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate recordedAt based on selected ageMonths and baby's birthDate
      const birth = new Date(selectedBaby.birthDate);

      let recordedAt;
      if (logType === 'today') {
        recordedAt = new Date().toISOString();
      } else {
        // Calculate historical date based on the age in months entered
        birth.setMonth(birth.getMonth() + monthValue);
        recordedAt = birth.toISOString();
      }

      const res = await babyService.logGrowth(selectedBaby.id, weight, height, recordedAt);
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful) {
        toast.success('Cập nhật chỉ số tăng trưởng thành công!');
        setWeight('');
        setHeight('');
        // Reload all data from backend to ensure state consistency
        await loadBabies(selectedBaby.id);
      } else {
        toast.error(res?.message || 'Lỗi khi cập nhật chỉ số');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi lưu chỉ số');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrowth = async (recordId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mốc đo lường này?')) {
      return;
    }

    try {
      const res = await babyService.deleteGrowth(selectedBaby.id, recordId);
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful) {
        toast.success('Xóa chỉ số thành công!');
        await loadBabies(selectedBaby.id);
      } else {
        toast.error(res?.message || 'Lỗi khi xóa chỉ số');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi xóa chỉ số');
    }
  };

  // Get WHO curves based on baby's gender
  const getWhoWeightData = () => {
    return selectedBaby?.gender === 0 ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
  };

  const getWhoHeightData = () => {
    return selectedBaby?.gender === 0 ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
  };

  // Combine WHO percentiles and user growth records
  const getCombinedChartData = (type) => {
    const whoData = type === 'weight' ? getWhoWeightData() : getWhoHeightData();
    const allMonths = Array.from(
      new Set([...whoData.map((d) => d.month), ...weightLogs.map((l) => l.month)])
    ).sort((a, b) => a - b);

    return allMonths.map((month) => {
      const whoNode = whoData.find((d) => d.month === month);
      const userPoint = weightLogs.find((l) => l.month === month);
      return {
        month,
        P3: whoNode?.P3,
        P15: whoNode?.P15,
        P50: whoNode?.P50,
        P85: whoNode?.P85,
        P97: whoNode?.P97,
        userValue: userPoint ? (type === 'weight' ? userPoint.weight : userPoint.height) : undefined
      };
    });
  };

  // Compare baby's latest logged index with WHO P50 standard
  const getLatestStatsSummary = () => {
    if (weightLogs.length === 0) return null;
    const latest = weightLogs[weightLogs.length - 1];

    const whoWeight = getWhoWeightData();
    const whoHeight = getWhoHeightData();

    // Find closest WHO weight and height standard node
    const closeWeightNode = whoWeight.reduce((prev, curr) => {
      return Math.abs(curr.month - latest.month) < Math.abs(prev.month - latest.month) ? curr : prev;
    });

    const closeHeightNode = whoHeight.reduce((prev, curr) => {
      return Math.abs(curr.month - latest.month) < Math.abs(prev.month - latest.month) ? curr : prev;
    });

    const diffWeight = latest.weight - closeWeightNode.P50;
    const diffHeight = latest.height - closeHeightNode.P50;

    let wStatus = 'Bình thường';
    let wColor = 'text-status-ok font-bold';
    if (latest.weight < closeWeightNode.P3) {
      wStatus = 'Nhẹ cân';
      wColor = 'text-status-warn-text font-bold';
    } else if (latest.weight > closeWeightNode.P97) {
      wStatus = 'Thừa cân';
      wColor = 'text-status-warn-text font-bold';
    }

    let hStatus = 'Bình thường';
    let hColor = 'text-status-ok font-bold';
    if (latest.height < closeHeightNode.P3) {
      hStatus = 'Thấp còi';
      hColor = 'text-status-warn-text font-bold';
    } else if (latest.height > closeHeightNode.P97) {
      hStatus = 'Cao vượt trội';
      hColor = 'text-theme-brand font-bold';
    }

    return {
      age: latest.month,
      weight: latest.weight,
      height: latest.height,
      diffWeight: diffWeight.toFixed(1),
      diffHeight: diffHeight.toFixed(1),
      wStatus,
      wColor,
      hStatus,
      hColor,
      p50Weight: closeWeightNode.P50,
      p50Height: closeHeightNode.P50
    };
  };

  const getGrowthWarning = () => {
    if (weightLogs.length === 0) return null;
    const latest = weightLogs[weightLogs.length - 1];
    const whoWeight = getWhoWeightData();

    const whoNode = whoWeight.reduce((prev, curr) => {
      return Math.abs(curr.month - latest.month) < Math.abs(prev.month - latest.month) ? curr : prev;
    });

    if (latest.weight < whoNode.P3) {
      return {
        type: 'critical',
        text: `Cảnh báo tăng trưởng: Cân nặng của bé (${latest.weight}kg) thấp hơn chuẩn P3 của WHO (${whoNode.P3}kg). Bé có nguy cơ suy dinh dưỡng nhẹ, mami cần bổ sung vi chất dinh dưỡng hoặc tham khảo ý kiến bác sĩ nhi khoa.`
      };
    }
    if (latest.weight > whoNode.P97) {
      return {
        type: 'warning',
        text: `Cảnh báo tăng trưởng: Cân nặng của bé (${latest.weight}kg) vượt mức P97 của WHO (${whoNode.P97}kg). Bé có tốc độ tăng trưởng quá nhanh, mami nên điều tiết cữ bú sữa và giảm đồ ngọt quá đà.`
      };
    }
    return {
      type: 'positive',
      text: 'Chỉ số tuyệt vời! Tốc độ tăng trưởng cân nặng và chiều cao của bé đang nằm trong biểu đồ chuẩn an toàn của WHO. Mami tiếp tục duy trì nhé!'
    };
  };

  if (loading) {
    return (
      <div className="font-display flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center animate-fade-in motion-reduce:animate-none">
        <div className="w-14 h-14 rounded-2xl bg-theme-sidebar border border-theme-line flex items-center justify-center text-theme-ink mb-4">
          <Loader2 className="w-7 h-7 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-theme-ink">
          Đang tải dữ liệu tăng trưởng...
        </h2>
        <p className="text-sm text-theme-muted font-medium mt-1">
          Đối chiếu biểu đồ chuẩn WHO theo tháng tuổi của bé
        </p>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="font-display max-w-lg mx-auto py-6 px-4 animate-fade-in motion-reduce:animate-none">
        <div className="bg-theme-surface border border-theme-line rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-theme-brand-soft border border-theme-line flex items-center justify-center text-theme-brand mx-auto">
              <Baby className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-theme-ink">
              Tạo hồ sơ bé yêu
            </h1>
            <p className="text-xs sm:text-sm text-theme-muted font-medium leading-relaxed">
              Nhập các chỉ số sơ sinh để Mom Ơi! lập biểu đồ theo dõi tăng trưởng chuẩn WHO cho bé.
            </p>
          </div>

          <form onSubmit={handleCreateBaby} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="setup-baby-name" className="block text-xs font-semibold text-theme-ink">
                Tên của bé
              </label>
              <input
                id="setup-baby-name"
                type="text"
                placeholder="Ví dụ: Bắp, Cà Rốt, Gấu..."
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="setup-birth-date" className="block text-xs font-semibold text-theme-ink">
                  Ngày sinh
                </label>
                <input
                  id="setup-birth-date"
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().substring(0, 10)}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="setup-baby-gender" className="block text-xs font-semibold text-theme-ink">
                  Giới tính
                </label>
                <select
                  id="setup-baby-gender"
                  value={babyGender}
                  onChange={(e) => setBabyGender(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                >
                  <option value="boy">Bé trai</option>
                  <option value="girl">Bé gái</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="setup-birth-weight" className="block text-xs font-semibold text-theme-ink">
                  Cân nặng sơ sinh (kg)
                </label>
                <input
                  id="setup-birth-weight"
                  type="number"
                  step="0.1"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="setup-birth-height" className="block text-xs font-semibold text-theme-ink">
                  Chiều cao sơ sinh (cm)
                </label>
                <input
                  id="setup-birth-height"
                  type="number"
                  value={birthHeight}
                  onChange={(e) => setBirthHeight(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-3 bg-theme-brand hover:bg-theme-ink text-theme-surface text-xs sm:text-sm font-bold rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:opacity-60"
            >
              {submitting ? 'Đang tạo...' : 'Tạo hồ sơ bé'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const warning = getGrowthWarning();
  const summary = getLatestStatsSummary();

  return (
    <div className="font-display space-y-6 pb-8 text-theme-ink">
      {/* Header Back */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/baby-nutrition')}
          className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Quay lại góc bé yêu</span>
        </button>
      </div>

      {/* Main Header & Baby Switcher */}
      <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-theme-ink flex items-center gap-2">
            <Activity className="w-6 h-6 text-theme-brand shrink-0" aria-hidden="true" />
            <span>Biểu đồ tăng trưởng chuẩn WHO</span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-muted font-medium leading-relaxed">
            Theo dõi sự phát triển thể chất của {formatBabyDisplayName(selectedBaby?.name)} dựa trên tiêu chuẩn tăng trưởng toàn cầu từ Tổ chức Y tế Thế giới (WHO).
          </p>
        </div>

        {/* Baby profile selection dropdown */}
        {babies.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="select-baby-profile" className="text-xs font-bold text-theme-ink">
              Chọn bé:
            </label>
            <div className="relative">
              <select
                id="select-baby-profile"
                value={selectedBaby?.id || ''}
                onChange={(e) => {
                  const target = babies.find((b) => b.id === parseInt(e.target.value, 10));
                  if (target) handleSelectBaby(target);
                }}
                className="appearance-none min-h-[44px] bg-theme-page border border-theme-line px-4 py-2 pr-9 rounded-2xl text-xs sm:text-sm font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand cursor-pointer"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.gender === 0 ? 'Bé trai' : 'Bé gái'})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                <ChevronRight className="w-4 h-4 rotate-90" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Warning Alert Banner */}
      {warning && (
        <section
          role="alert"
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
            warning.type === 'positive'
              ? 'bg-theme-surface border-status-ok text-theme-ink'
              : 'bg-status-warn-bg border-status-warn-line text-status-warn-text'
          }`}
        >
          {warning.type === 'positive' ? (
            <Activity className="w-5 h-5 text-status-ok shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-status-warn-text shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span>{warning.text}</span>
        </section>
      )}

      {/* Dashboard Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line shadow-sm space-y-2.5 flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-2 text-theme-muted">
              <Calendar className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold">Tháng tuổi hiện tại</span>
            </div>
            <div>
              <span className="text-xl font-bold text-theme-ink block">{summary.age} tháng</span>
              <span className="text-xs text-theme-muted block font-medium mt-1">
                Ngày sinh:{' '}
                {selectedBaby
                  ? (() => {
                      const d = new Date(selectedBaby.birthDate);
                      return !isNaN(d.getTime())
                        ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
                            .toString()
                            .padStart(2, '0')}/${d.getFullYear()}`
                        : '';
                    })()
                  : ''}
              </span>
            </div>
          </div>

          <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line shadow-sm space-y-2.5 flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-2 text-theme-muted">
              <Scale className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold">Cân nặng đo cuối</span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl font-bold text-theme-ink">{summary.weight} kg</span>
                <span className={`text-xs ${summary.wColor}`}>({summary.wStatus})</span>
              </div>
              <span className="text-xs text-theme-muted block font-medium mt-1">
                WHO P50: {summary.p50Weight} kg (
                {parseFloat(summary.diffWeight) >= 0 ? `+${summary.diffWeight}` : summary.diffWeight} kg)
              </span>
            </div>
          </div>

          <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line shadow-sm space-y-2.5 flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-2 text-theme-muted">
              <ArrowUpRight className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold">Chiều cao đo cuối</span>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl font-bold text-theme-ink">{summary.height} cm</span>
                <span className={`text-xs ${summary.hColor}`}>({summary.hStatus})</span>
              </div>
              <span className="text-xs text-theme-muted block font-medium mt-1">
                WHO P50: {summary.p50Height} cm (
                {parseFloat(summary.diffHeight) >= 0 ? `+${summary.diffHeight}` : summary.diffHeight} cm)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Chart & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Middle Column: Chart Component */}
        <section className="lg:col-span-2 bg-theme-surface p-5 sm:p-6 rounded-2xl border border-theme-line shadow-sm flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-theme-line pb-4">
            <h2 className="text-base font-bold text-theme-ink flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Đồ thị phát triển ({activeTab === 'weight' ? 'kg theo tháng tuổi' : 'cm theo tháng tuổi'})</span>
            </h2>

            {/* Custom tab switcher to show weight OR height */}
            <div className="flex bg-theme-page p-1 rounded-2xl border border-theme-line w-full sm:w-auto gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('weight')}
                className={`flex-1 sm:flex-none min-h-[40px] px-4 py-1.5 rounded-md text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  activeTab === 'weight'
                    ? 'bg-theme-ink text-theme-surface'
                    : 'text-theme-ink hover:bg-theme-sidebar'
                }`}
              >
                Cân nặng (kg)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('height')}
                className={`flex-1 sm:flex-none min-h-[40px] px-4 py-1.5 rounded-md text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  activeTab === 'height'
                    ? 'bg-theme-ink text-theme-surface'
                    : 'text-theme-ink hover:bg-theme-sidebar'
                }`}
              >
                Chiều cao (cm)
              </button>
            </div>
          </div>

          {/* Recharts chart area */}
          <div className="h-72 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={getCombinedChartData(activeTab)}
                margin={{ top: 12, right: 16, left: -12, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fontWeight: 600, fill: 'rgb(var(--c-ink))' }}
                  tickMargin={6}
                />
                <YAxis
                  domain={activeTab === 'weight' ? [1, 16] : [40, 100]}
                  tick={{ fontSize: 12, fontWeight: 600, fill: 'rgb(var(--c-muted))' }}
                  width={42}
                />

                <Tooltip content={<GrowthChartTooltip unitSymbol={activeTab === 'weight' ? 'kg' : 'cm'} />} />

                {/* WHO Standard Lines */}
                <Line
                  type="monotone"
                  name="Chuẩn WHO P3 (Thấp)"
                  dataKey="P3"
                  stroke="rgb(var(--c-line))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  name="Chuẩn WHO P15"
                  dataKey="P15"
                  stroke="rgb(var(--c-muted))"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  name="Chuẩn WHO P50 (Trung bình)"
                  dataKey="P50"
                  stroke="rgb(var(--c-ok))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  name="Chuẩn WHO P85"
                  dataKey="P85"
                  stroke="rgb(var(--c-muted))"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  name="Chuẩn WHO P97 (Cao)"
                  dataKey="P97"
                  stroke="rgb(var(--c-line))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />

                {/* Main Baby Curve */}
                <Line
                  type="monotone"
                  name="Bé của bạn"
                  dataKey="userValue"
                  stroke="rgb(var(--c-brand))"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: 'rgb(var(--c-brand))',
                    strokeWidth: 2,
                    stroke: 'rgb(var(--c-surface))'
                  }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legends Explanation */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-theme-muted pt-3 border-t border-theme-line">
            <span className="flex items-center gap-2 text-theme-ink">
              <span className="w-4 h-1 bg-theme-brand rounded"></span>
              <span>Bé của bạn</span>
            </span>
            <span className="flex items-center gap-2 text-theme-ink">
              <span className="w-4 h-0.5 bg-status-ok rounded"></span>
              <span>Chuẩn trung vị WHO P50</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-theme-muted"></span>
              <span>Ngưỡng chuẩn WHO (P3 - P97)</span>
            </span>
          </div>
        </section>

        {/* Right Column: Logging Form Card */}
        <section className="bg-theme-surface p-5 sm:p-6 rounded-2xl border border-theme-line shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-theme-ink flex items-center gap-2 border-b border-theme-line pb-3">
              <Plus className="w-5 h-5 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Ghi nhận chỉ số mới</span>
            </h2>

            {/* Toggle choice for logging target */}
            <div className="grid grid-cols-2 gap-1 bg-theme-page p-1 rounded-2xl border border-theme-line text-xs font-bold">
              <button
                type="button"
                onClick={() => setLogType('today')}
                className={`min-h-[40px] py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  logType === 'today'
                    ? 'bg-theme-ink text-theme-surface'
                    : 'text-theme-ink hover:bg-theme-sidebar'
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setLogType('history')}
                className={`min-h-[40px] py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  logType === 'history'
                    ? 'bg-theme-ink text-theme-surface'
                    : 'text-theme-ink hover:bg-theme-sidebar'
                }`}
              >
                Mốc lịch sử
              </button>
            </div>

            <form onSubmit={handleLogGrowth} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="growth-age-months" className="block text-xs font-semibold text-theme-ink">
                  Tháng tuổi của bé
                </label>
                {logType === 'today' ? (
                  <div className="w-full min-h-[44px] px-3.5 py-2.5 bg-theme-page border border-theme-line rounded-2xl text-xs sm:text-sm font-bold text-theme-ink flex flex-wrap items-center justify-between gap-2">
                    <span>Tháng {ageMonths}</span>
                    <span className="text-xs font-semibold text-theme-brand bg-theme-brand-soft px-2.5 py-0.5 rounded-full">
                      Tự động tính từ ngày sinh
                    </span>
                  </div>
                ) : (
                  <select
                    id="growth-age-months"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  >
                    <option value="0">Sơ sinh (0 tháng)</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng thứ {i + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="growth-weight-input" className="block text-xs font-semibold text-theme-ink">
                  Cân nặng (kg)
                </label>
                <div className="relative">
                  <input
                    id="growth-weight-input"
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="40"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ví dụ: 8.6"
                    className="w-full min-h-[44px] pl-3.5 pr-12 py-2.5 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted text-xs font-bold">
                    kg
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="growth-height-input" className="block text-xs font-semibold text-theme-ink">
                  Chiều cao (cm)
                </label>
                <div className="relative">
                  <input
                    id="growth-height-input"
                    type="number"
                    step="0.1"
                    min="30"
                    max="140"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ví dụ: 69.2"
                    className="w-full min-h-[44px] pl-3.5 pr-12 py-2.5 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted text-xs font-bold">
                    cm
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] py-3 bg-theme-brand hover:bg-theme-ink text-theme-surface text-xs sm:text-sm font-bold rounded-2xl transition-colors mt-2 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:opacity-60"
              >
                {submitting ? 'Đang cập nhật...' : 'Ghi nhận chỉ số'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-theme-line text-xs font-medium text-theme-muted leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-theme-brand shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Các chỉ số sau khi ghi nhận sẽ tự động đồng bộ hóa lên hệ thống phân tích AI để cập nhật khuyến nghị thực đơn dinh dưỡng tương ứng.
            </span>
          </div>
        </section>
      </div>

      {/* History Log Section */}
      <section className="bg-theme-surface p-5 sm:p-6 rounded-2xl border border-theme-line shadow-sm space-y-4">
        <div className="border-b border-theme-line pb-3">
          <h2 className="text-base font-bold text-theme-ink flex items-center gap-2">
            <Calendar className="w-5 h-5 text-theme-brand shrink-0" aria-hidden="true" />
            <span>Lịch sử đo lường và đánh giá chuẩn</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs text-theme-ink">
            <thead>
              <tr className="border-b border-theme-line text-xs font-bold text-theme-muted">
                <th className="py-3 px-3">Mốc tuổi</th>
                <th className="py-3 px-3">Ngày ghi nhận</th>
                <th className="py-3 px-3">Cân nặng (kg)</th>
                <th className="py-3 px-3">Chiều cao (cm)</th>
                <th className="py-3 px-3">Đánh giá chung (Chuẩn WHO)</th>
                <th className="py-3 px-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-line font-semibold">
              {weightLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 px-3 text-center text-xs sm:text-sm text-theme-muted font-medium">
                    Chưa có mốc đo lường nào được ghi nhận cho bé.
                  </td>
                </tr>
              ) : (
                weightLogs.map((log) => {
                  const dateObj = new Date(log.recordedAt);
                  const dateStr = !isNaN(dateObj.getTime())
                    ? `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}/${dateObj.getFullYear()}`
                    : '-';

                  // Determine evaluations locally for listing
                  const whoW = getWhoWeightData();
                  const whoH = getWhoHeightData();
                  const nodeW = whoW.reduce((prev, curr) =>
                    Math.abs(curr.month - log.month) < Math.abs(prev.month - log.month) ? curr : prev
                  );
                  const nodeH = whoH.reduce((prev, curr) =>
                    Math.abs(curr.month - log.month) < Math.abs(prev.month - log.month) ? curr : prev
                  );

                  let evalText = 'Bình thường';
                  let evalBadge = 'bg-status-ok text-theme-surface border-status-ok';

                  if (log.weight < nodeW.P3 || log.height < nodeH.P3) {
                    evalText = 'Cần chú ý (Dưới chuẩn)';
                    evalBadge = 'bg-status-warn-bg text-status-warn-text border-status-warn-line';
                  } else if (log.weight > nodeW.P97) {
                    evalText = 'Thừa cân';
                    evalBadge = 'bg-status-warn-bg text-status-warn-text border-status-warn-line';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-theme-page/60 transition-colors">
                      <td className="py-3.5 px-3 text-theme-ink font-bold text-xs sm:text-sm">
                        {log.month === 0 ? 'Sơ sinh (0 tháng)' : `${log.month} tháng`}
                      </td>
                      <td className="py-3.5 px-3 text-theme-muted text-xs">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-theme-ink">{log.weight} kg</span>
                        <span className="text-xs text-theme-muted block font-medium">
                          WHO P50: {nodeW.P50}kg
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-theme-ink">{log.height} cm</span>
                        <span className="text-xs text-theme-muted block font-medium">
                          WHO P50: {nodeH.P50}cm
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full border text-xs font-bold ${evalBadge}`}>
                          {evalText}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteGrowth(log.id)}
                          aria-label={`Xóa mốc đo tháng ${log.month}`}
                          className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 text-theme-muted hover:text-status-warn-text hover:bg-status-warn-bg rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                          title="Xóa mốc đo này"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
