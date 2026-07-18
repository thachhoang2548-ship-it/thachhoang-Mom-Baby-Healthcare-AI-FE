import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import { useProfileController } from '../../../controllers/profileController';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { ArrowLeft, Scale, ArrowUpRight, Activity, ShieldAlert, Sparkles, Plus, Trash2, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
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
  const [birthDate, setBirthDate] = useState(new Date().toISOString().substring(0, 10));
  const [birthWeight, setBirthWeight] = useState('3.2');
  const [birthHeight, setBirthHeight] = useState('50');

  useEffect(() => {
    loadBabies();
  }, []);

  useEffect(() => {
    if (momProfile && (momProfile.stage === 2 || momProfile.stage === 'Postpartum' || momProfile.journeyStage === 'Postpartum') && momProfile.deliveryDate) {
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
      const diffMonths = Math.max(0, (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth()));
      setAgeMonths(Math.min(24, diffMonths).toString());
    }
  }, [selectedBaby, logType]);

  const loadBabies = async () => {
    setLoading(true);
    try {
      const res = await babyService.getProfiles();
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful && res.data && res.data.length > 0) {
        setBabies(res.data);
        // Retain selection if reloading, otherwise default to first baby
        const defaultBaby = selectedBaby ? res.data.find(b => b.id === selectedBaby.id) || res.data[0] : res.data[0];
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
  };

  const parseAndSetLogs = (baby) => {
    let logs = [];
    if (baby.growthRecords && baby.growthRecords.length > 0) {
      logs = baby.growthRecords.map(g => {
        const birth = new Date(baby.birthDate);
        const record = new Date(g.recordedAt);
        // Calendar month calculation to eliminate floating point rounding error
        const diffMonths = Math.max(0, (record.getFullYear() - birth.getFullYear()) * 12 + (record.getMonth() - birth.getMonth()));
        return {
          id: g.id,
          month: diffMonths,
          weight: g.weightKg,
          height: g.heightCm,
          recordedAt: g.recordedAt
        };
      });
    }

    // Add baseline month 0 if missing
    if (!logs.some(l => l.month === 0)) {
      logs.unshift({
        id: 'baseline',
        month: 0,
        weight: baby.birthWeightKg || baby.currentWeightKg || 3.2,
        height: baby.birthHeightCm || baby.currentHeightCm || 50,
        recordedAt: baby.birthDate
      });
    }

    setWeightLogs(logs.sort((a, b) => a.month - b.month));
  };

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

        toast.success('Thiết lập hồ sơ bé thành công! 🎉');
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

    const monthValue = parseInt(ageMonths);
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
        toast.success('Cập nhật chỉ số tăng trưởng thành công! ⚖️');
        setWeight('');
        setHeight('');
        // Reload all data from backend to ensure state consistency
        await loadBabies();
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
    if (recordId === 'baseline') {
      toast.error('Không thể xóa chỉ số sơ sinh ban đầu.');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa mốc đo lường này?')) {
      return;
    }

    try {
      const res = await babyService.deleteGrowth(selectedBaby.id, recordId);
      const isSuccessful = res && (res.isSuccess || res.success);
      if (isSuccessful) {
        toast.success('Xóa chỉ số thành công!');
        await loadBabies();
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
    const allMonths = Array.from(new Set([
      ...whoData.map(d => d.month),
      ...weightLogs.map(l => l.month)
    ])).sort((a, b) => a - b);

    return allMonths.map((month) => {
      const whoNode = whoData.find(d => d.month === month);
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
    let wColor = 'text-green-655 dark:text-green-400 font-bold';
    if (latest.weight < closeWeightNode.P3) {
      wStatus = 'Nhẹ cân';
      wColor = 'text-red-500 font-bold';
    } else if (latest.weight > closeWeightNode.P97) {
      wStatus = 'Thừa cân';
      wColor = 'text-amber-500 font-bold';
    }

    let hStatus = 'Bình thường';
    let hColor = 'text-green-655 dark:text-green-400 font-bold';
    if (latest.height < closeHeightNode.P3) {
      hStatus = 'Thấp còi';
      hColor = 'text-red-500 font-bold';
    } else if (latest.height > closeHeightNode.P97) {
      hStatus = 'Cao vượt trội';
      hColor = 'text-indigo-500 font-bold';
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
        text: `Cảnh báo tăng trưởng: Cân nặng của bé (${latest.weight}kg) thấp hơn chuẩn P3 của WHO (${whoNode.P3}kg). Bé có nguy cơ suy dinh dưỡng nhẹ, mami cần bổ sung vi chất dinh dưỡng hoặc tham khảo ý kiến bác sĩ nhi khoa. 🚨`
      };
    }
    if (latest.weight > whoNode.P97) {
      return {
        type: 'warning',
        text: `Cảnh báo tăng trưởng: Cân nặng của bé (${latest.weight}kg) vượt mức P97 của WHO (${whoNode.P97}kg). Bé có tốc độ tăng trưởng quá nhanh, mami nên điều tiết cữ bú sữa và giảm đồ ngọt quá đà. 🧡`
      };
    }
    return {
      type: 'positive',
      text: 'Chỉ số tuyệt vời! Tốc độ tăng trưởng cân nặng và chiều cao của bé đang nằm trong biểu đồ chuẩn an toàn của WHO. Mami tiếp tục duy trì nhé! 💚'
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-6 bg-pink-100/50 rounded-xl w-1/4"></div>
        <div className="h-44 bg-pink-50/50 rounded-3xl"></div>
        <div className="h-96 bg-pink-50/50 rounded-3xl"></div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-6 px-4">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white mx-auto shadow-lg">
            <Plus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-855 dark:text-white uppercase tracking-wider">
            Tạo Hồ Sơ Bé Yêu 👶
          </h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Nhập các chỉ số sơ sinh để Mom Ơi! lập biểu đồ theo dõi tăng trưởng chuẩn WHO cho bé.
          </p>
        </div>

        <form onSubmit={handleCreateBaby} className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/50 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tên của bé</label>
            <input
              type="text"
              placeholder="Ví dụ: Bắp, Cà Rốt, Gấu..."
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30 focus:border-momPink"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ngày sinh</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Giới tính</label>
              <select
                value={babyGender}
                onChange={(e) => setBabyGender(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
              >
                <option value="boy">Bé Trai 👦</option>
                <option value="girl">Bé Gái 👧</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cân nặng sơ sinh (kg)</label>
              <input
                type="number"
                step="0.1"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Chiều cao sơ sinh (cm)</label>
              <input
                type="number"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow active:scale-95"
          >
            {submitting ? 'Đang tạo...' : 'Tạo hồ sơ bé'}
          </button>
        </form>
      </div>
    );
  }

  const warning = getGrowthWarning();
  const summary = getLatestStatsSummary();

  const CustomChartTooltip = ({ active, payload, label, unitSymbol }) => {
    if (active && payload && payload.length) {
      const babyVal = payload.find(p => p.dataKey === 'userValue')?.value;
      const p50Val = payload.find(p => p.dataKey === 'P50')?.value;
      const difference = babyVal && p50Val ? (babyVal - p50Val).toFixed(1) : null;
      
      return (
        <div className="bg-white/95 dark:bg-gray-850 p-4 border border-pink-100 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold text-gray-750 dark:text-gray-200">
          <p className="font-extrabold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1.5 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-momPink" /> {label === 0 ? 'Sơ sinh (0 tháng)' : `${label} tháng tuổi`}
          </p>
          <div className="space-y-1">
            {babyVal !== undefined && (
              <p className="flex justify-between items-center gap-6">
                <span>Bé của bạn:</span>
                <span className="font-bold text-momPink">{babyVal} {unitSymbol}</span>
              </p>
            )}
            {p50Val !== undefined && (
              <p className="flex justify-between items-center gap-6 text-gray-500 dark:text-gray-400">
                <span>Chuẩn WHO P50:</span>
                <span className="font-bold">{p50Val} {unitSymbol}</span>
              </p>
            )}
            {difference !== null && (
              <p className="flex justify-between items-center gap-6 text-[10px] border-t border-dashed border-gray-100 dark:border-gray-700 pt-1 mt-1 font-bold">
                <span>Độ lệch chuẩn:</span>
                <span className={parseFloat(difference) >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {parseFloat(difference) > 0 ? `+${difference}` : difference} {unitSymbol}
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12">
      
      {/* Header Back */}
      <button
        onClick={() => navigate('/baby-nutrition')}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-momPink dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại góc Bé yêu
      </button>

      {/* Main Header & Baby Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-pink-100/30 dark:border-gray-700/50 pb-5">
        <div>
          <h2 className="text-2xl font-black text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
            Biểu Đồ Tăng Trưởng Chuẩn WHO <Sparkles className="w-5 h-5 text-momPink animate-pulse" />
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold mt-1 leading-relaxed">
            Theo dõi sự phát triển thể chất của bé {selectedBaby?.name} dựa trên tiêu chuẩn tăng trưởng toàn cầu từ Tổ chức Y tế Thế giới (WHO).
          </p>
        </div>

        {/* Baby profile selection dropdown */}
        {babies.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Chọn bé:</span>
            <div className="relative">
              <select
                value={selectedBaby?.id || ''}
                onChange={(e) => {
                  const target = babies.find(b => b.id === parseInt(e.target.value));
                  if (target) handleSelectBaby(target);
                }}
                className="appearance-none bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/80 px-4 py-2 pr-8 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-momPink/30 focus:border-momPink shadow-sm cursor-pointer"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.gender === 0 ? 'Bé trai 👦' : 'Bé gái 👧'})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Alert Banner */}
      {warning && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold leading-relaxed shadow-sm transition-all duration-300 ${
          warning.type === 'critical' 
            ? 'bg-red-50/70 border-red-200/60 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300' 
            : warning.type === 'warning'
            ? 'bg-amber-50/70 border-amber-250/60 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
            : 'bg-green-50/70 border-green-200/60 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300'
        }`}>
          {warning.type === 'critical' ? (
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Activity className="w-5 h-5 text-momPink shrink-0 mt-0.5" />
          )}
          <span>{warning.text}</span>
        </div>
      )}

      {/* Dashboard Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-755 shadow-sm space-y-3 animate-fade-in flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-4 h-4 text-momPink shrink-0 -mt-[2px]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Tháng tuổi hiện tại</span>
            </div>
            <div>
              <span className="text-xl font-black text-gray-850 dark:text-white block">{summary.age} tháng</span>
              <span className="text-[9px] text-gray-400 block font-semibold mt-1">
                Ngày sinh: {selectedBaby ? (() => {
                  const d = new Date(selectedBaby.birthDate);
                  return !isNaN(d.getTime()) 
                    ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
                    : '';
                })() : ''}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-755 shadow-sm space-y-3 animate-fade-in flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Scale className="w-4 h-4 text-momPink shrink-0 -mt-[2px]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Cân nặng đo cuối</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-850 dark:text-white">{summary.weight} kg</span>
                <span className={`text-[10px] ${summary.wColor}`}>({summary.wStatus})</span>
              </div>
              <span className="text-[9px] text-gray-400 block font-semibold mt-1">WHO P50: {summary.p50Weight} kg ({parseFloat(summary.diffWeight) >= 0 ? `+${summary.diffWeight}` : summary.diffWeight} kg)</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-755 shadow-sm space-y-3 animate-fade-in flex flex-col justify-between min-h-[115px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <ArrowUpRight className="w-4.5 h-4.5 text-momPurple shrink-0 -mt-[2px]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Chiều cao đo cuối</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-855 dark:text-white">{summary.height} cm</span>
                <span className={`text-[10px] ${summary.hColor}`}>({summary.hStatus})</span>
              </div>
              <span className="text-[9px] text-gray-400 block font-semibold mt-1">WHO P50: {summary.p50Height} cm ({parseFloat(summary.diffHeight) >= 0 ? `+${summary.diffHeight}` : summary.diffHeight} cm)</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Chart & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left & Middle Column: Beautiful Chart Component */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-150 dark:border-gray-700/60 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-momPink shrink-0" />
                Đồ thị phát triển
              </h3>
            </div>

            {/* Custom tab switcher to show weight OR height */}
            <div className="flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('weight')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'weight'
                    ? 'bg-white dark:bg-gray-850 text-momPink shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Cân nặng (kg)
              </button>
              <button
                onClick={() => setActiveTab('height')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'height'
                    ? 'bg-white dark:bg-gray-850 text-momPurple shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Chiều cao (cm)
              </button>
            </div>
          </div>

          {/* Recharts chart area */}
          <div className="h-80 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={getCombinedChartData(activeTab)}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }}
                  label={{ value: 'Tháng tuổi', position: 'insideBottomRight', offset: -10, style: { fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' } }} 
                />
                <YAxis 
                  domain={activeTab === 'weight' ? [1, 16] : [40, 100]} 
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#94a3b8' }} 
                />
                
                <Tooltip content={<CustomChartTooltip unitSymbol={activeTab === 'weight' ? 'kg' : 'cm'} />} />
                
                {/* WHO Standard Lines */}
                <Line type="monotone" name="Chuẩn WHO P3 (Thấp)" dataKey="P3" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" name="Chuẩn WHO P15" dataKey="P15" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" name="Chuẩn WHO P50 (Trung bình)" dataKey="P50" stroke="#64748b" strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" name="Chuẩn WHO P85" dataKey="P85" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" name="Chuẩn WHO P97 (Cao)" dataKey="P97" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1} dot={false} connectNulls />
                
                {/* Main Baby Curve with custom gradients */}
                <Line 
                  type="monotone" 
                  name="Bé của bạn" 
                  dataKey="userValue" 
                  stroke={activeTab === 'weight' ? '#FF7A8A' : '#8B5CF6'} 
                  strokeWidth={3.5} 
                  dot={{ r: 6, fill: activeTab === 'weight' ? '#FF7A8A' : '#8B5CF6', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  connectNulls 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legends Explanation */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[9px] font-bold text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/50">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-gradient-to-r from-momPink to-momPurple rounded"></span> Bé của bạn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-gray-500 rounded"></span> Chuẩn trung vị WHO P50
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t border-dashed border-gray-300"></span> Ngưỡng an toàn chuẩn WHO (P3 - P97)
            </span>
          </div>
        </div>

        {/* Right Column: Logging Form Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider text-center flex items-center justify-center gap-1.5 border-b border-gray-100 dark:border-gray-700/50 pb-3">
              Ghi nhận chỉ số mới 📏
            </h3>

            {/* Toggle choice for logging target */}
            <div className="grid grid-cols-2 gap-1 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-[10px] font-bold text-gray-500">
              <button
                type="button"
                onClick={() => setLogType('today')}
                className={`py-1.5 rounded-lg transition-all duration-200 ${
                  logType === 'today'
                    ? 'bg-white dark:bg-gray-800 text-momPink shadow-sm font-black'
                    : 'hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => setLogType('history')}
                className={`py-1.5 rounded-lg transition-all duration-200 ${
                  logType === 'history'
                    ? 'bg-white dark:bg-gray-800 text-momPurple shadow-sm font-black'
                    : 'hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Mốc lịch sử
              </button>
            </div>

            <form onSubmit={handleLogGrowth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tháng tuổi của bé</label>
                {logType === 'today' ? (
                  <div className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 flex items-center justify-between">
                    <span>Tháng {ageMonths}</span>
                    <span className="text-[9px] font-medium text-momPink italic bg-pink-50/50 dark:bg-pink-950/20 px-2 py-0.5 rounded-full">Tự động tính từ ngày sinh</span>
                  </div>
                ) : (
                  <select
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30 text-gray-850 dark:text-white"
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cân nặng (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="40"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ví dụ: 8.6"
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30 focus:border-momPink text-gray-800 dark:text-white"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">kg</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chiều cao (cm)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="140"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ví dụ: 69.2"
                    className="w-full pl-3 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30 focus:border-momPink text-gray-800 dark:text-white"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">cm</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow active:scale-95 mt-2 flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Đang cập nhật...' : 'Ghi nhận chỉ số'}
              </button>
            </form>
          </div>
          
          <div className="mt-4 pt-3 border-t border-dashed border-gray-150 dark:border-gray-700/80 text-[10px] font-semibold text-gray-400 leading-normal flex items-start gap-1">
            <span className="text-momPink">💡</span>
            <span>Các chỉ số sau khi ghi nhận sẽ tự động đồng bộ hóa lên hệ thống phân tích AI để cập nhật khuyến nghị thực đơn hạt dinh dưỡng tương ứng.</span>
          </div>
        </div>
      </div>

      {/* History Log Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-755 shadow-sm space-y-4">
        <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-5 h-5 text-momPink shrink-0 translate-y-[-1px]" />
            Lịch sử đo lường & Đánh giá chuẩn
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-700/60 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mốc tuổi</th>
                <th className="py-2.5 px-3">Ngày ghi nhận</th>
                <th className="py-2.5 px-3">Cân nặng (kg)</th>
                <th className="py-2.5 px-3">Chiều cao (cm)</th>
                <th className="py-2.5 px-3">Đánh giá chung (Chuẩn WHO)</th>
                <th className="py-2.5 px-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-semibold">
              {weightLogs.map((log) => {
                const dateObj = new Date(log.recordedAt);
                const dateStr = !isNaN(dateObj.getTime()) 
                  ? `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`
                  : '-';
                  
                // Determine evaluations locally for listing
                const whoW = getWhoWeightData();
                const whoH = getWhoHeightData();
                const nodeW = whoW.reduce((prev, curr) => Math.abs(curr.month - log.month) < Math.abs(prev.month - log.month) ? curr : prev);
                const nodeH = whoH.reduce((prev, curr) => Math.abs(curr.month - log.month) < Math.abs(prev.month - log.month) ? curr : prev);

                let evalText = 'Bình thường';
                let evalBadge = 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 border-green-200/50';

                if (log.weight < nodeW.P3 || log.height < nodeH.P3) {
                  evalText = 'Cần chú ý (Dưới chuẩn)';
                  evalBadge = 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300 border-red-200/50';
                } else if (log.weight > nodeW.P97) {
                  evalText = 'Thừa cân';
                  evalBadge = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border-amber-200/50';
                }

                return (
                  <tr key={log.id} className="hover:bg-pink-50/10 dark:hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-3 text-gray-800 dark:text-white font-black text-xs">
                      {log.month === 0 ? 'Sơ sinh (0 tháng)' : `${log.month} tháng`}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-[11px]">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3">
                      <span>{log.weight} kg</span>
                      <span className="text-[9px] text-gray-400 block font-normal">WHO P50: {nodeW.P50}kg</span>
                    </td>
                    <td className="py-3 px-3">
                      <span>{log.height} cm</span>
                      <span className="text-[9px] text-gray-400 block font-normal">WHO P50: {nodeH.P50}cm</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] ${evalBadge}`}>
                        {evalText}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {log.id === 'baseline' ? (
                        <span className="text-[10px] text-gray-400 font-bold italic">Mốc gốc</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteGrowth(log.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all active:scale-90"
                          title="Xóa mốc đo này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
