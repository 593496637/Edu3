// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IYDToken
 * @dev Interface for the YDToken contract.
 * We only need to define the functions that this contract will call.
 */
interface IYDToken {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

/**
 * @title CoursePlatform
 * @dev This contract manages the creation and ownership of courses on the platform.
 * All transactions are settled using the YDToken.
 */
contract CoursePlatform is Ownable {
    // 引用 YDToken 合约的地址
    IYDToken public immutable ydToken;

    // 管理员地址映射
    mapping(address => bool) public admins;
    
    // 认证讲师地址映射
    mapping(address => bool) public approvedInstructors;
    
    // 平台手续费率 (以基点为单位，例如 500 = 5%)
    uint256 public platformFeeRate = 500; // 默认5%
    
    // 平台收入地址
    address public platformTreasury;

    // 定义 Course 结构体，用于存储课程的核心链上信息
    struct Course {
        address creator; // 课程创建者的地址
        uint256 priceInYd; // 以 YD 代币计价的课程价格
    }

    // --- Mappings for data storage ---

    // 映射 1: 通过课程 ID (来自后端的 UUID) 查找课程信息
    mapping(uint256 => Course) public courses;

    // 映射 2: 记录一个地址是否拥有某个课程
    // mapping(courseId => mapping(studentAddress => hasOwnership))
    mapping(uint256 => mapping(address => bool)) public courseOwnership;

    // 映射 3: 记录每个课程的购买人数
    mapping(uint256 => uint256) public coursePurchaseCount;

    // --- Events for off-chain indexing ---

    // 事件 1: 当一个新课程被创建时触发
    event CourseCreated(
        uint256 indexed courseId,
        address indexed creator,
        uint256 priceInYd
    );

    // 事件 2: 当一个课程被购买时触发
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        address indexed creator
    );

    // 事件 3: 当管理员被添加时触发
    event AdminAdded(address indexed admin);
    
    // 事件 4: 当管理员被移除时触发
    event AdminRemoved(address indexed admin);
    
    // 事件 5: 当讲师被认证时触发
    event InstructorApproved(address indexed instructor);
    
    // 事件 6: 当讲师认证被取消时触发
    event InstructorRevoked(address indexed instructor);
    
    // 事件 7: 当课程被删除时触发
    event CourseDeleted(uint256 indexed courseId, address indexed creator);
    
    // 事件 8: 当平台手续费率更新时触发
    event PlatformFeeRateUpdated(uint256 oldRate, uint256 newRate);
    
    // 事件 9: 当平台收入地址更新时触发
    event PlatformTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    
    // 事件 10: 当平台收取手续费时触发
    event PlatformFeeCollected(uint256 indexed courseId, address indexed from, uint256 feeAmount);

    /**
     * @dev Sets the address of the YDToken contract. This is done once at deployment.
     * @param _ydTokenAddress The deployed address of the YDToken contract.
     */
    constructor(
        address _ydTokenAddress,
        address initialOwner,
        address _platformTreasury
    ) Ownable(initialOwner) {
        require(
            _ydTokenAddress != address(0),
            "CoursePlatform: Invalid YDToken address"
        );
        require(
            _platformTreasury != address(0),
            "CoursePlatform: Invalid treasury address"
        );
        ydToken = IYDToken(_ydTokenAddress);
        platformTreasury = _platformTreasury;
        
        // 合约部署者自动成为第一个管理员
        admins[initialOwner] = true;
    }

    /**
     * @dev 修饰符：只有管理员可以执行
     */
    modifier onlyAdmin() {
        require(admins[msg.sender], "CoursePlatform: Not an admin");
        _;
    }

    /**
     * @dev 添加管理员 (只有owner可以执行)
     */
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "CoursePlatform: Invalid address");
        require(!admins[_admin], "CoursePlatform: Already an admin");
        
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    /**
     * @dev 移除管理员 (只有owner可以执行)
     */
    function removeAdmin(address _admin) external onlyOwner {
        require(admins[_admin], "CoursePlatform: Not an admin");
        
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    /**
     * @dev 批准讲师 (管理员可以执行)
     */
    function approveInstructor(address _instructor) external onlyAdmin {
        require(_instructor != address(0), "CoursePlatform: Invalid address");
        require(!approvedInstructors[_instructor], "CoursePlatform: Already approved");
        
        approvedInstructors[_instructor] = true;
        emit InstructorApproved(_instructor);
    }

    /**
     * @dev 取消讲师认证 (管理员可以执行)
     */
    function revokeInstructor(address _instructor) external onlyAdmin {
        require(approvedInstructors[_instructor], "CoursePlatform: Not approved instructor");
        
        approvedInstructors[_instructor] = false;
        emit InstructorRevoked(_instructor);
    }

    /**
     * @dev 更新平台手续费率 (只有owner可以执行)
     * @param _newFeeRate 新的手续费率 (基点，例如 500 = 5%)
     */
    function setPlatformFeeRate(uint256 _newFeeRate) external onlyOwner {
        require(_newFeeRate <= 1000, "CoursePlatform: Fee rate too high (max 10%)");
        
        uint256 oldRate = platformFeeRate;
        platformFeeRate = _newFeeRate;
        emit PlatformFeeRateUpdated(oldRate, _newFeeRate);
    }

    /**
     * @dev 更新平台收入地址 (只有owner可以执行)
     * @param _newTreasury 新的收入地址
     */
    function setPlatformTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "CoursePlatform: Invalid treasury address");
        
        address oldTreasury = platformTreasury;
        platformTreasury = _newTreasury;
        emit PlatformTreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @dev Allows a creator to register a new course on the blockchain.
     * The _courseId is a unique identifier generated by the off-chain backend.
     * @param _courseId The unique ID for the course.
     * @param _priceInYd The price of the course in YD tokens.
     */
    function createCourse(uint256 _courseId, uint256 _priceInYd) external {
        // 检查是否为认证讲师
        require(
            approvedInstructors[msg.sender],
            "CoursePlatform: Not an approved instructor"
        );
        
        // 确保课程 ID 未被使用
        require(
            courses[_courseId].creator == address(0),
            "CoursePlatform: Course ID already exists."
        );
        // 价格必须大于 0
        require(
            _priceInYd > 0,
            "CoursePlatform: Price must be greater than zero."
        );

        // 在链上存储课程信息
        courses[_courseId] = Course({
            creator: msg.sender,
            priceInYd: _priceInYd
        });

        // 默认将课程所有权授予创建者
        courseOwnership[_courseId][msg.sender] = true;

        // 触发事件，以便 The Graph 等链下服务可以索引此信息
        emit CourseCreated(_courseId, msg.sender, _priceInYd);
    }

    /**
     * @dev Allows a student to purchase a course.
     * IMPORTANT: The student must have first called the `approve` function on the
     * YDToken contract, authorizing this CoursePlatform contract to spend
     * at least the course's price on their behalf.
     * @param _courseId The ID of the course to purchase.
     */
    function purchaseCourse(uint256 _courseId) external {
        Course storage courseToPurchase = courses[_courseId];

        // 检查 1: 课程必须存在
        require(
            courseToPurchase.creator != address(0),
            "CoursePlatform: Course does not exist."
        );
        // 检查 2: 用户不能重复购买
        require(
            !courseOwnership[_courseId][msg.sender],
            "CoursePlatform: You already own this course."
        );

        address creator = courseToPurchase.creator;
        uint256 price = courseToPurchase.priceInYd;

        // 计算平台手续费和创作者收入
        uint256 platformFee = (price * platformFeeRate) / 10000;
        uint256 creatorPayment = price - platformFee;

        // 转账给创作者
        bool successCreator = ydToken.transferFrom(msg.sender, creator, creatorPayment);
        require(successCreator, "CoursePlatform: YD token transfer to creator failed.");

        // 转账平台手续费
        if (platformFee > 0) {
            bool successPlatform = ydToken.transferFrom(msg.sender, platformTreasury, platformFee);
            require(successPlatform, "CoursePlatform: YD token transfer to platform failed.");
            
            emit PlatformFeeCollected(_courseId, msg.sender, platformFee);
        }

        // 更新链上所有权记录
        courseOwnership[_courseId][msg.sender] = true;
        
        // 增加课程购买计数
        coursePurchaseCount[_courseId]++;

        // 触发购买成功事件
        emit CoursePurchased(_courseId, msg.sender, creator);
    }

    /**
     * @dev Allows the course creator to delete a course that has not been purchased by anyone.
     * Only unpurchased courses can be deleted to protect existing students' access rights.
     * @param _courseId The ID of the course to delete.
     */
    function deleteCourse(uint256 _courseId) external {
        Course storage courseToDelete = courses[_courseId];
        
        // 检查 1: 课程必须存在
        require(
            courseToDelete.creator != address(0),
            "CoursePlatform: Course does not exist."
        );
        
        // 检查 2: 只有课程创建者可以删除
        require(
            courseToDelete.creator == msg.sender,
            "CoursePlatform: Only course creator can delete."
        );
        
        // 检查 3: 只能删除没有人购买的课程（保护已购买学生的权益）
        require(
            coursePurchaseCount[_courseId] == 0,
            "CoursePlatform: Cannot delete course with existing purchases."
        );
        
        // 删除课程创建者的默认所有权
        courseOwnership[_courseId][msg.sender] = false;
        
        // 删除课程记录
        delete courses[_courseId];
        
        // 触发删除事件
        emit CourseDeleted(_courseId, msg.sender);
    }
}
