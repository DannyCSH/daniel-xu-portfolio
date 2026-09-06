window.APP_DATA = {
  capitals: [
    {name:"北京",province:"北京",coord:[116.4074,39.9042]},{name:"天津",province:"天津",coord:[117.2008,39.0842]},{name:"石家庄",province:"河北",coord:[114.5149,38.0428]},{name:"太原",province:"山西",coord:[112.5489,37.8706]},{name:"呼和浩特",province:"内蒙古",coord:[111.7492,40.8424]},{name:"沈阳",province:"辽宁",coord:[123.4315,41.8057]},{name:"长春",province:"吉林",coord:[125.3235,43.8171]},{name:"哈尔滨",province:"黑龙江",coord:[126.5349,45.8038]},
    {name:"上海",province:"上海",coord:[121.4737,31.2304]},{name:"南京",province:"江苏",coord:[118.7969,32.0603]},{name:"杭州",province:"浙江",coord:[120.1551,30.2741]},{name:"合肥",province:"安徽",coord:[117.2272,31.8206]},{name:"福州",province:"福建",coord:[119.2965,26.0745]},{name:"南昌",province:"江西",coord:[115.8581,28.6832]},{name:"济南",province:"山东",coord:[117.1205,36.6519]},{name:"郑州",province:"河南",coord:[113.6254,34.7466]},
    {name:"武汉",province:"湖北",coord:[114.3055,30.5928]},{name:"长沙",province:"湖南",coord:[112.9388,28.2282]},{name:"广州",province:"广东",coord:[113.2644,23.1291]},{name:"南宁",province:"广西",coord:[108.3669,22.817]},{name:"海口",province:"海南",coord:[110.3312,20.0319]},{name:"重庆",province:"重庆",coord:[106.5516,29.563]},{name:"成都",province:"四川",coord:[104.0665,30.5723]},{name:"贵阳",province:"贵州",coord:[106.6302,26.6477]},
    {name:"昆明",province:"云南",coord:[102.8329,24.8801]},{name:"拉萨",province:"西藏",coord:[91.1409,29.6456]},{name:"西安",province:"陕西",coord:[108.9398,34.3416]},{name:"兰州",province:"甘肃",coord:[103.8343,36.0611]},{name:"西宁",province:"青海",coord:[101.7782,36.6171]},{name:"银川",province:"宁夏",coord:[106.2309,38.4872]},{name:"乌鲁木齐",province:"新疆",coord:[87.6168,43.8256]},{name:"台北",province:"台湾",coord:[121.5654,25.033]},{name:"香港",province:"香港",coord:[114.1694,22.3193]},{name:"澳门",province:"澳门",coord:[113.5439,22.1987]}
  ],
  branches: [
    {id:"b1",name:"深圳分行 · 南山支行",short:"南山支行",province:"广东",city:"深圳",coord:[113.945,22.539],customers:328,opportunity:96,center:[113.945,22.539]},
    {id:"b2",name:"深圳分行 · 福田支行",short:"福田支行",province:"广东",city:"深圳",coord:[114.066,22.548],customers:215,opportunity:91,center:[114.066,22.548]},
    {id:"b3",name:"深圳分行 · 宝安支行",short:"宝安支行",province:"广东",city:"深圳",coord:[113.885,22.585],customers:286,opportunity:89,center:[113.885,22.585]},
    {id:"b4",name:"广州分行 · 天河支行",short:"天河支行",province:"广东",city:"广州",coord:[113.361,23.124],customers:304,opportunity:87,center:[113.361,23.124]},
    {id:"b5",name:"成都分行 · 天府新区支行",short:"天府新区支行",province:"四川",city:"成都",coord:[104.072,30.514],customers:247,opportunity:84,center:[104.072,30.514]},
    {id:"b6",name:"上海分行 · 浦东科技支行",short:"浦东科技支行",province:"上海",city:"上海",coord:[121.544,31.222],customers:278,opportunity:83,center:[121.544,31.222]},
    {id:"b7",name:"北京分行 · 中关村支行",short:"中关村支行",province:"北京",city:"北京",coord:[116.316,39.983],customers:261,opportunity:82,center:[116.316,39.983]},
    {id:"b8",name:"杭州分行 · 滨江支行",short:"滨江支行",province:"浙江",city:"杭州",coord:[120.211,30.208],customers:198,opportunity:80,center:[120.211,30.208]}
  ],
  industries: [
    { id: "semiconductor", name: "半导体产业链", short: "半导体", score: 82.6, change: 4.8, companies: "6,618", core: "18.7%", demand: "28.4亿", grade: "景气上行", icon: "cpu", color: "#b41f2d", trend: [70,72,73,74,76,77,79,78,80,81,82,83], forecast: [84,85,86] },
    { id: "robot", name: "机器人产业链", short: "机器人", score: 78.4, change: 3.1, companies: "9,977", core: "14.2%", demand: "19.7亿", grade: "稳中向好", icon: "bot", color: "#0b7568", trend: [67,69,70,70,71,73,72,74,75,76,77,78], forecast: [79,80,81] },
    { id: "nev", name: "新能源汽车产业链", short: "新能源车", score: 75.9, change: -1.2, companies: "2,024", core: "21.6%", demand: "35.2亿", grade: "高位调整", icon: "car-front", color: "#386ca8", trend: [78,79,80,81,80,79,78,77,77,76,76,76], forecast: [75,76,77] },
    { id: "biomed", name: "生物医药产业链", short: "生物医药", score: 73.2, change: 2.4, companies: "1,268", core: "16.4%", demand: "11.8亿", grade: "温和复苏", icon: "microscope", color: "#b97919", trend: [66,67,68,68,69,69,70,71,71,72,72,73], forecast: [74,75,76] },
    { id: "lowalt", name: "低空经济产业链", short: "低空经济", score: 86.8, change: 6.7, companies: "386", core: "24.1%", demand: "9.3亿", grade: "快速上行", icon: "plane", color: "#5c6186", trend: [59,62,64,66,69,72,75,78,81,83,85,87], forecast: [89,90,91] }
  ],
  customers: [
    { id: "c1", uid: "44030520260018", name: "深圳智芯半导体有限公司", logo: "智芯", industry: "半导体产业链", industryId: "semiconductor", node: "晶圆制造设备", stage: "中游", district: "南山区", size: "中型企业", tier: "核心层", opportunity: 92, credit: "7,800万", creditNum: 7800, creditLevel: 5, gap: "+2,600万", settlement: "3.26亿", deposit: "4,860万", policy: 94, action: "设备更新贷", tags: ["专精特新", "设备更新", "额度缺口"], status: "待触达", risk: "低", coord: [113.945,22.539], owner: "张经理", registeredCapital:"1.2亿元", paidCapital:"8,600万元", address:"深圳市南山区科技园科苑路 18 号", phone:"0755-8888 2618", appointment:"需提前 2 个工作日预约财务负责人", referral:"可由存量客户“鹏城精密”财务总监协助引荐", nextAction:"本周携设备更新政策清单拜访", evidence:"订单增长 18%、额度缺口 2,600 万、政策契合度 94%" },
    { id: "c2", uid: "44030620260131", name: "深能储科新能源有限公司", logo: "储科", industry: "新能源汽车产业链", industryId: "nev", node: "储能电池系统", stage: "中游", district: "宝安区", size: "大型企业", tier: "核心层", opportunity: 89, credit: "9,500万", creditNum: 9500, creditLevel: 5, gap: "+3,100万", settlement: "5.18亿", deposit: "7,320万", policy: 91, action: "供应链融资", tags: ["链主生态", "扩产", "额度缺口"], status: "已沟通", risk: "低", coord: [113.885,22.585], owner: "李经理", registeredCapital:"2.8亿元", paidCapital:"2.1亿元", address:"深圳市宝安区新安街道创业二路 88 号", phone:"0755-8666 9012", appointment:"园区访客需提前 1 天登记", referral:"本行客户“湾区材料”与其存在年度采购合作", nextAction:"联动交易银行经理确认核心供应商白名单", evidence:"扩产项目已备案、结算量同比增长 24%、授信缺口 3,100 万" },
    { id: "c3", uid: "44030720260077", name: "鹏城精密机器人股份有限公司", logo: "鹏机", industry: "机器人产业链", industryId: "robot", node: "伺服与控制器", stage: "上游", district: "龙岗区", size: "中型企业", tier: "骨干层", opportunity: 87, credit: "6,200万", creditNum: 6200, creditLevel: 4, gap: "+1,800万", settlement: "2.14亿", deposit: "2,930万", policy: 88, action: "票据池", tags: ["高成长", "政策匹配", "票据活跃"], status: "方案推进", risk: "中", coord: [114.245,22.705], owner: "周经理", registeredCapital:"8,000万元", paidCapital:"6,500万元", address:"深圳市龙岗区坂田街道工业路 27 号", phone:"0755-8321 7736", appointment:"建议预约董事会秘书或财务总监", referral:"智芯半导体为其本行合作客户，可提供供应链引荐", nextAction:"两日内发送票据池收益测算并预约方案复核", evidence:"票据结算占比 46%、应收账期延长 11 天、政策契合度 88%" },
    { id: "c4", uid: "44030520260206", name: "海源生物技术有限公司", logo: "海源", industry: "生物医药产业链", industryId: "biomed", node: "生物技术研发", stage: "中游", district: "南山区", size: "小型企业", tier: "骨干层", opportunity: 84, credit: "3,600万", creditNum: 3600, gap: "+1,400万", settlement: "0.86亿", deposit: "1,240万", policy: 96, action: "研发信用贷", tags: ["研发投入高", "高政策匹配"], status: "待触达", risk: "中", coord: [113.925,22.566], owner: "张经理" },
    { id: "c5", uid: "44031120260042", name: "云岭低空科技股份有限公司", logo: "云岭", industry: "低空经济产业链", industryId: "lowalt", node: "飞控与航电", stage: "上游", district: "光明区", size: "中型企业", tier: "核心层", opportunity: 83, credit: "5,800万", creditNum: 5800, gap: "+2,100万", settlement: "1.72亿", deposit: "2,180万", policy: 97, action: "科创成长贷", tags: ["低空经济", "核心技术", "额度缺口"], status: "审批落地", risk: "低", coord: [113.944,22.752], owner: "吴经理" },
    { id: "c6", uid: "44030420260189", name: "华创封装材料有限公司", logo: "华材", industry: "半导体产业链", industryId: "semiconductor", node: "封装材料", stage: "上游", district: "福田区", size: "小型企业", tier: "骨干层", opportunity: 81, credit: "2,900万", creditNum: 2900, gap: "+900万", settlement: "0.94亿", deposit: "1,060万", policy: 86, action: "订单融资", tags: ["进口替代", "订单增长"], status: "已沟通", risk: "中", coord: [114.066,22.548], owner: "张经理" },
    { id: "c7", uid: "44030920260055", name: "联擎工业视觉有限公司", logo: "联擎", industry: "机器人产业链", industryId: "robot", node: "机器视觉", stage: "上游", district: "龙华区", size: "小型企业", tier: "基础层", opportunity: 76, credit: "1,800万", creditNum: 1800, gap: "+600万", settlement: "0.48亿", deposit: "620万", policy: 82, action: "科创信用贷", tags: ["成长型", "首贷培育"], status: "待触达", risk: "中", coord: [114.035,22.687], owner: "刘经理" },
    { id: "c8", uid: "44031020260091", name: "湾区先进药物研究院有限公司", logo: "湾药", industry: "生物医药产业链", industryId: "biomed", node: "创新药研发", stage: "上游", district: "坪山区", size: "小型企业", tier: "基础层", opportunity: 74, credit: "2,200万", creditNum: 2200, gap: "+700万", settlement: "0.36亿", deposit: "510万", policy: 93, action: "知识产权质押", tags: ["临床二期", "政策匹配"], status: "风险关注", risk: "高", coord: [114.35,22.686], owner: "陈经理" }
  ],
  policies: [
    { id: "p1", day: "15", month: "JUL", level: "深圳市", title: "深圳市关于推动半导体与集成电路产业高质量发展的若干措施（示例）", summary: "聚焦先进制造、关键设备与材料、EDA 工具等环节，支持设备更新、研发投入与产业化。", source: "深圳市工业和信息化局", match: 96, industry: "半导体", deadline: "2026-07-29", customers: 38 },
    { id: "p2", day: "12", month: "JUL", level: "国家级", title: "制造业新型技术改造城市试点申报工作指引（示例）", summary: "支持数字化、绿色化和智能化技术改造，重点覆盖设备购置、产线升级与工业软件。", source: "工业和信息化部", match: 91, industry: "先进制造", deadline: "2026-08-15", customers: 72 },
    { id: "p3", day: "09", month: "JUL", level: "南山区", title: "南山区促进专精特新企业发展专项支持计划（示例）", summary: "面向专精特新企业提供研发、融资和场景应用支持，可与科创金融产品协同。", source: "南山区企业发展服务中心", match: 89, industry: "多产业", deadline: "2026-07-24", customers: 46 },
    { id: "p4", day: "05", month: "JUL", level: "深圳市", title: "低空经济基础设施与应用场景建设行动方案（示例）", summary: "推进低空起降设施、通信导航、飞控系统和场景运营，释放产业链融资需求。", source: "深圳市发展和改革委员会", match: 87, industry: "低空经济", deadline: "2026-09-10", customers: 19 },
    { id: "p5", day: "28", month: "JUN", level: "国家级", title: "大规模设备更新和消费品以旧换新支持政策（示例）", summary: "引导金融机构加大制造业中长期贷款支持，服务重点行业设备更新与技术改造。", source: "国家发展和改革委员会", match: 84, industry: "制造业", deadline: "滚动申报", customers: 105 },
    { id: "p6", day: "20", month: "JUL", level: "国家级", title: "新能源汽车产业高质量发展若干政策措施（示例）", summary: "支持新能源汽车整车与动力电池、电驱系统、充电基础设施协同发展，鼓励供应链金融与绿色信贷产品创新。", source: "工业和信息化部", match: 93, industry: "新能源汽车", deadline: "2026-09-30", customers: 56 },
    { id: "p7", day: "08", month: "JUL", level: "深圳市", title: "深圳市促进智能网联汽车产业创新发展行动方案（示例）", summary: "围绕智能驾驶、车路协同与汽车电子，支持关键零部件企业扩产与场景示范，可与科创信贷、供应链融资联动。", source: "深圳市交通运输局", match: 90, industry: "智能网联汽车", deadline: "2026-08-20", customers: 31 }
  ],
  districts: [
    { name: "南山区", value: 328, credit: 9.6, opportunity: 92 }, { name: "福田区", value: 215, credit: 7.4, opportunity: 76 },
    { name: "宝安区", value: 286, credit: 8.8, opportunity: 84 }, { name: "龙岗区", value: 174, credit: 5.3, opportunity: 79 },
    { name: "龙华区", value: 112, credit: 3.2, opportunity: 73 }, { name: "光明区", value: 68, credit: 2.7, opportunity: 88 },
    { name: "坪山区", value: 47, credit: 1.9, opportunity: 81 }, { name: "罗湖区", value: 39, credit: 1.3, opportunity: 61 },
    { name: "盐田区", value: 17, credit: .6, opportunity: 58 }, { name: "大鹏新区", value: 8, credit: .2, opportunity: 55 }
  ],
  chains: {
    semiconductor: [
      { title: "上游 · 设备与材料", count: 173, nodes: [{name:"光刻/刻蚀设备",score:88,risk:true},{name:"硅片与特气",score:76,risk:true},{name:"封装材料",score:82}] },
      { title: "中游 · 设计与制造", count: 598, nodes: [{name:"芯片设计",score:91},{name:"晶圆制造",score:79,risk:true},{name:"封装测试",score:84}] },
      { title: "下游 · 应用市场", count: 5847, nodes: [{name:"消费电子",score:74},{name:"汽车电子",score:87},{name:"工业控制",score:81}] }
    ],
    robot: [
      { title: "上游 · 核心零部件", count: 373, nodes: [{name:"减速器",score:74,risk:true},{name:"伺服系统",score:86},{name:"机器视觉",score:83}] },
      { title: "中游 · 本体制造", count: 598, nodes: [{name:"工业机器人",score:82},{name:"服务机器人",score:79},{name:"特种机器人",score:77}] },
      { title: "下游 · 集成应用", count: 9006, nodes: [{name:"汽车制造",score:84},{name:"3C电子",score:80},{name:"仓储物流",score:76}] }
    ]
  },
  agenda: [
    { time: "09:30", title: "智芯半导体 · 设备更新需求访谈", desc: "准备额度测算与政策匹配清单", type: "客户拜访" },
    { time: "11:00", title: "深能储科 · 供应链融资方案沟通", desc: "确认核心供应商白名单", type: "视频会议" },
    { time: "14:30", title: "鹏城机器人 · 票据池方案复核", desc: "联动产品经理完成收益测算", type: "内部协同" },
    { time: "16:00", title: "海源生物 · 政策申报提醒", desc: "南山区专项窗口 7 天后截止", type: "电话触达" }
  ]
};
