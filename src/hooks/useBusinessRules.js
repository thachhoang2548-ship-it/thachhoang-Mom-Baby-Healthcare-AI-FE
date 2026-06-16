import { useMemo } from 'react';

export function useBusinessRules() {
  const evaluateBR01 = (cycleDay) => {
    const dayNum = Number(cycleDay);
    const isInWindow = dayNum >= 11 && dayNum <= 16;
    return {
      triggered: isInWindow,
      title: 'Cửa sổ thụ thai vàng! 🌸',
      message: isInWindow
        ? 'Hôm nay là ngày tốt nhất để thụ thai! Tần suất sinh hoạt lý tưởng là 2 ngày/lần.'
        : 'Hiện tại mami chưa nằm trong cửa sổ thụ thai vàng. Hãy giữ tinh thần vui vẻ thoải mái nhé.',
      suggestion: 'Bổ sung axit folic, giữ tâm lý thoải mái và duy trì lối sống lành mạnh.',
    };
  };

  const evaluateBR02 = (foodName) => {
    if (!foodName) return null;
    const lower = foodName.toLowerCase().trim();

    const unsafeItems = [
      {
        keys: ['rau ngót', 'rau ngot'],
        title: 'Cảnh báo: Rau ngót 🥬',
        message: 'Rau ngót chứa Papaverin có thể gây co thắt tử cung, tăng nguy cơ sảy thai sớm.',
        suggestion: 'Mami có thể thay thế bằng rau mồng tơi hoặc rau đay nấu chín kỹ nhé.',
      },
      {
        keys: ['dứa', 'quả dứa', 'thom', 'quả thơm', 'khom', 'quả khóm', 'pineapple'],
        title: 'Cảnh báo: Quả dứa 🍍',
        message: 'Dứa chứa Bromelain làm mềm tử cung, dễ gây co bóp mạnh nguy hiểm ở tam cá nguyệt đầu.',
        suggestion: 'Hãy ăn chuối, táo hoặc xoài chín ngọt mát làm nguồn vitamin thay thế an toàn.',
      },
      {
        keys: ['cá sống', 'ca song', 'sushi', 'sashimi', 'raw fish'],
        title: 'Cảnh báo: Sushi / Cá sống 🍣',
        message: 'Cá sống mang nguy cơ cao nhiễm vi khuẩn Listeria, sán và độc tố kim loại nặng.',
        suggestion: 'Mami nên chọn ăn Cá hồi chín kỹ nướng muối hoặc súp cá nấu chín nóng hổi.',
      },
      {
        keys: ['trứng lòng đào', 'trung long dao', 'trứng sống', 'trung song', 'raw egg'],
        title: 'Cảnh báo: Trứng lòng đào 🍳',
        message: 'Nguy cơ ngộ độc thực phẩm do vi khuẩn Salmonella chưa được tiêu diệt hoàn toàn.',
        suggestion: 'Nên ăn Trứng luộc chín hoàn toàn hoặc trứng đúc thịt rán chín vàng giòn.',
      },
      {
        keys: ['rượu', 'bia', 'cồn', 'alcohol', 'wine', 'beer'],
        title: 'Cảnh báo nguy hiểm: Chất cồn 🍷',
        message: 'Rượu bia là tác nhân trực tiếp gây hội chứng ngộ độc rượu ở bào thai (FASD) và dị tật bẩm sinh.',
        suggestion: 'Hãy thay thế bằng nước dừa tươi thanh mát hoặc nước ép cam giàu vitamin C.',
      },
      {
        keys: ['đu đủ xanh', 'du du xanh', 'green papaya'],
        title: 'Cảnh báo: Đu đủ xanh 🥗',
        message: 'Đu đủ xanh chứa nhiều mủ (latex) và papain kích thích các cơn co thắt tử cung mạnh.',
        suggestion: 'Mami có thể ăn đu đủ chín hoàn toàn (vỏ vàng mềm) với lượng vừa phải rất tốt cho tiêu hóa.',
      },
      {
        keys: ['rau má', 'rau ma', 'pennywort'],
        title: 'Cảnh báo: Rau má 🥤',
        message: 'Nước rau má có tính hàn cao, có thể gây lạnh bụng, tiêu chảy và kích thích tử cung.',
        suggestion: 'Hãy uống nước lọc ấm hoặc sữa hạt hạt sen bổ dưỡng.',
      },
    ];

    const match = unsafeItems.find((item) =>
      item.keys.some((k) => lower.includes(k))
    );

    if (match) {
      return {
        triggered: true,
        title: match.title,
        message: match.message,
        suggestion: match.suggestion,
      };
    }

    return null;
  };

  const evaluateBR03 = (steps) => {
    if (steps === null || steps === undefined || steps === '') return null;
    const stepNum = Number(steps);
    const triggered = stepNum < 3000;
    return {
      triggered,
      title: 'Cảnh báo: Ít vận động 🚶‍♀️',
      message: triggered
        ? `Hôm nay mami chỉ đi ${stepNum} bước (dưới 3.000 bước). Vận động quá ít làm giảm tuần hoàn máu và dễ gây đau mỏi cơ xương.`
        : `Mami đã đi được ${stepNum} bước! Mức vận động rất tốt giúp khí huyết lưu thông hiệu quả.`,
      suggestion: triggered
        ? 'Hãy đi bộ nhẹ nhàng trong nhà hoặc sân vườn khoảng 10-15 phút để duy trì sức khỏe nhé mami.'
        : 'Duy trì nhịp đi bộ vừa phải và không đứng quá lâu một chỗ.',
    };
  };

  const evaluateBR04 = (weightDiff) => {
    if (weightDiff === null || weightDiff === undefined || weightDiff === '') return null;
    const diff = Number(weightDiff);
    const isUnder = diff < 0.2;
    const isOver = diff > 0.9;
    const triggered = isUnder || isOver;

    let message = 'Tốc độ tăng cân tốt mami nhé! Hãy duy trì vận động nhẹ nhàng.';
    let suggestion = 'Tiếp tục duy trì thực đơn lành mạnh và uống sữa tiệt trùng đầy đủ.';

    if (isUnder) {
      message = `Cân nặng tăng ít (${diff}kg/tuần). Khuyến nghị y tế: Mẹ bầu nên tăng từ 0.2kg - 0.9kg mỗi tuần ở tam cá nguyệt 2 & 3.`;
      suggestion = 'Bổ sung thêm các bữa phụ bổ dưỡng như hạt óc chó, hạnh nhân, quả bơ hoặc sữa bầu.';
    } else if (isOver) {
      message = `Tốc độ tăng cân quá nhanh (${diff}kg/tuần). Tăng trên 0.9kg/tuần cảnh báo nguy cơ tiểu đường thai kỳ hoặc phù nề tích nước.`;
      suggestion = 'Hạn chế ăn đồ ngọt, giảm tinh bột tinh chế và muối trong khẩu phần ăn, tham khảo ý kiến bác sĩ phụ sản.';
    }

    return {
      triggered,
      title: triggered ? 'Cảnh báo: Cân nặng bất thường ⚖️' : 'Chỉ số cân nặng lý tưởng ✨',
      message,
      suggestion,
    };
  };

  return {
    evaluateBR01,
    evaluateBR02,
    evaluateBR03,
    evaluateBR04,
  };
}
