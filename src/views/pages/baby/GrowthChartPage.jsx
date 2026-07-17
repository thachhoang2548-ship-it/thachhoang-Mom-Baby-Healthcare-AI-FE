import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import { useProfileController } from '../../../controllers/profileController';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ComposedChart } from 'recharts';
import { ArrowLeft, Scale, ArrowUpRight, Activity, ShieldAlert, Sparkles, CheckCircle2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// WHO standard weight percentile values (boys/girls average in kg)
const WHO_WEIGHT_DATA = [
  { month: 0, P3: 2.4, P15: 2.8, P50: 3.3, P85: 3.9, P97: 4.4 },
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

// WHO standard height percentile values (boys/girls average in cm)
const WHO_HEIGHT_DATA = [
  { month: 0, P3: 46.0, P15: 48.0, P50: 50.0, P85: 52.0, P97: 54.0 },
  { month: 2, P3: 53.0, P15: 55.0, P50: 57.0, P85: 59.0, P97: 61.0 },
  { month: 4, P3: 58.0, P15: 60.5, P50: 62.5, P85: 64.5, P97: 66.5 },
  { month: 6, P3: 61.5, P15: 64.0, P50: 66.0, P85: 68.0, P97: 70.0 },
  { month: 8, P3: 64.5, P15: 67.0, P50: 69.0, P85: 71.0, P97: 73.0 },
  { month: 10, P3: 67.0, P15: 69.5, P50: 71.5, P85: 73.5, P97: 76.0 },
  { month: 12, P3: 69.0, P15: 72.0, P50: 74.0, P85: 76.0, P97: 78.5 },
  { month: 15, P3: 72.5, P15: 75.0, P50: 77.5, P85: 80.0, P97: 82.5 },
  { month: 18, P3: 75.5, P15: 78.5, P50: 81.0, P85: 83.5, P97: 86.5 },
  { month: 21, P3: 78.5, P15: 81.5, P50: 84.0, P85: 87.0, P97: 90.0 },
  { month: 24, P3: 81.0, P15: 84.0, P50: 87.0, P85: 90.0, P97: 93.0 }
];

export default function GrowthChartPage() {
  const navigate = useNavigate();
  const { momProfile, updateProfile } = useProfileController();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  // Growth logs
  const [weightLogs, setWeightLogs] = useState([]);
  
  // Input form state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
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

  const loadBabies = async () => {
    setLoading(true);
    try {
      const res = await babyService.getProfiles();
      if (res.isSuccess && res.data && res.data.length > 0) {
        setBabies(res.data);
        const baby = res.data[0];
        setSelectedBaby(baby);

        let logs = [];
        if (baby.growthRecords && baby.growthRecords.length > 0) {
          logs = baby.growthRecords.map(g => {
            const birthTime = new Date(baby.birthDate).getTime();
            const logTime = new Date(g.recordedAt).getTime();
            const diffMonths = Math.max(0, Math.floor((logTime - birthTime) / (1000 * 60 * 60 * 24 * 30.44)));
            return {
              month: diffMonths,
              weight: g.weightKg,
              height: g.heightCm
            };
          });
        }

        if (!logs.some(l => l.month === 0)) {
          logs.unshift({
            month: 0,
            weight: baby.birthWeightKg || 3.2,
            height: baby.birthHeightCm || 50
          });
        }

        setWeightLogs(logs.sort((a, b) => a.month - b.month));
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

  const handleCreateBaby = async (e) => {
    e.preventDefault();
    if (!babyName.trim()) {
      toast.error('Vui lòng nhập tên bé');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: babyName,
        gender: babyGender === 'boy' ? 0 : 1,
        birthDate: new Date(birthDate).toISOString(),
        birthWeightKg: parseFloat(birthWeight),
        birthHeightCm: parseFloat(birthHeight),
        currentWeightKg: parseFloat(birthWeight),
        currentHeightCm: parseFloat(birthHeight)
      };

      const res = await babyService.createProfile(payload);
      if (res.isSuccess) {
        // Automatically sync mother's stage to Postpartum
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
        toast.error('Không thể tạo hồ sơ bé');
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

    setSubmitting(true);
    try {
      const res = await babyService.logGrowth(selectedBaby.id, weight, height);
      if (res.isSuccess) {
        toast.success('Cập nhật chỉ số tăng trưởng thành công! ⚖️');
        
        // Add to local state
        const newLog = {
          month: parseInt(ageMonths),
          weight: parseFloat(weight),
          height: parseFloat(height)
        };

        setWeightLogs((prev) => {
          // Remove existing month entry if exists, then append
          const filtered = prev.filter((l) => l.month !== newLog.month);
          return [...filtered, newLog].sort((a, b) => a.month - b.month);
        });

        setWeight('');
        setHeight('');
        setAgeMonths('');
      } else {
        toast.error('Lỗi khi cập nhật chỉ số');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi lưu chỉ số');
    } finally {
      setSubmitting(false);
    }
  };

  // Combine WHO percentiles and user growth records
  const getCombinedChartData = (type) => {
    const whoData = type === 'weight' ? WHO_WEIGHT_DATA : WHO_HEIGHT_DATA;
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

  // Client side alert check
  const getGrowthWarning = () => {
    if (weightLogs.length === 0) return null;
    const latest = weightLogs[weightLogs.length - 1];
    
    // Find closest WHO standard weight node
    const whoNode = WHO_WEIGHT_DATA.reduce((prev, curr) => {
      return Math.abs(curr.month - latest.month) < Math.abs(prev.month - latest.month) ? curr : prev;
    });

    if (latest.weight < whoNode.P3) {
      return {
        type: 'critical',
        text: 'Cảnh báo tăng trưởng: Cân nặng của bé thấp hơn mức P3 của WHO. Bé có nguy cơ suy dinh dưỡng nhẹ, mami cần tăng cường vi chất dinh dưỡng hoặc tham khảo ý kiến bác sĩ nhi khoa. 🚨'
      };
    }
    if (latest.weight > whoNode.P97) {
      return {
        type: 'warning',
        text: 'Cảnh báo tăng trưởng: Cân nặng của bé cao hơn mức P97 của WHO. Bé có tốc độ tăng trưởng nhanh, mami nên điều tiết cữ bú sữa hạt và tránh đồ ngọt quá đà. 🧡'
      };
    }
    return {
      type: 'positive',
      text: 'Chỉ số tuyệt vời! Tốc độ tăng trưởng cân nặng của bé đang nằm trong biểu đồ chuẩn an toàn của WHO. 💚'
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-pink-100/50 rounded-xl w-1/4"></div>
        <div className="h-64 bg-pink-50/50 rounded-3xl"></div>
      </div>
    );
  }

  // Setup form if no babies
  if (setupMode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white mx-auto shadow-lg">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-gray-850 dark:text-white uppercase tracking-wider">
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
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Giới tính</label>
              <select
                value={babyGender}
                onChange={(e) => setBabyGender(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold"
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
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Chiều cao sơ sinh (cm)</label>
              <input
                type="number"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold"
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

  return (
    <div className="space-y-6">
      
      {/* Header Back */}
      <button
        onClick={() => navigate('/baby-nutrition')}
        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại góc Bé yêu
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-850 dark:text-white uppercase tracking-wider">
            Biểu Đồ Tăng Trưởng Chuẩn WHO 📈
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold mt-0.5">
            Theo dõi phát triển thể chất của bé {selectedBaby?.name} ({selectedBaby?.gender === 0 ? 'Bé trai' : 'Bé gái'})
          </p>
        </div>
      </div>

      {/* Warning Alert Banner */}
      {warning && (
        <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs font-semibold leading-relaxed animate-slide-in ${
          warning.type === 'critical' 
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300' 
            : warning.type === 'warning'
            ? 'bg-amber-50 border-amber-250 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
            : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300'
        }`}>
          {warning.type === 'critical' ? (
            <ShieldAlert className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
          ) : (
            <Activity className="w-5 h-5 text-momPink shrink-0 mt-0.5" />
          )}
          <span>{warning.text}</span>
        </div>
      )}

      {/* Recharts Chart Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weight Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-momPink" /> Cân nặng theo tháng tuổi (kg)
          </h3>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={getCombinedChartData('weight')} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" label={{ value: 'Tháng tuổi', position: 'insideBottomRight', offset: -10, style: { fontSize: 9, fontWeight: 'bold' } }} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis domain={[1, 16]} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="P3" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P15" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P50" stroke="#475569" strokeWidth={1.5} dot={false} label="WHO P50" connectNulls />
                <Line type="monotone" dataKey="P85" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P97" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="userValue" name="Bé của bạn" stroke="#FF7A8A" strokeWidth={3} dot={{ r: 5, fill: '#FF7A8A', strokeWidth: 2, stroke: '#fff' }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Height Chart */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-4.5 h-4.5 text-momPurple" /> Chiều cao theo tháng tuổi (cm)
          </h3>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={getCombinedChartData('height')} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" label={{ value: 'Tháng tuổi', position: 'insideBottomRight', offset: -10, style: { fontSize: 9, fontWeight: 'bold' } }} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="P3" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P15" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P50" stroke="#475569" strokeWidth={1.5} dot={false} connectNulls />
                <Line type="monotone" dataKey="P85" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="P97" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} dot={false} connectNulls />
                <Line type="monotone" dataKey="userValue" name="Bé của bạn" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Log Indicators Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm max-w-xl mx-auto space-y-4">
        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider text-center">
          Cập nhật chỉ số hôm nay 📏
        </h3>
        
        <form onSubmit={handleLogGrowth} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tháng tuổi của bé</label>
            <input
              type="number"
              min="0"
              max="24"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              placeholder="Ví dụ: 8"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-momPink/30"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Cân nặng (kg)</label>
            <input
              type="number"
              step="0.05"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ví dụ: 8.6"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-momPink/30"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Chiều cao (cm)</label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ví dụ: 69.2"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-momPink/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-3 w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow active:scale-95 mt-2"
          >
            {submitting ? 'Đang cập nhật...' : 'Ghi nhận chỉ số'}
          </button>
        </form>
      </div>

    </div>
  );
}
