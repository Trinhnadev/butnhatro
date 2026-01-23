const Room = require('../models/Room');

// @desc    Get all rooms with filters
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            district,
            ward,
            minPrice,
            maxPrice,
            priceRange,
            people,
            furnitures,
            search,
            includeArchived,
            petFriendly,
            carParking,
        } = req.query;

        // Build query
        const query = {};

        // Filter archived rooms (default: exclude archived)
        if (includeArchived !== 'true') {
            query.isArchived = false;
        }

        // Pet friendly filter
        if (petFriendly === 'true') {
            query['amenities.petFriendly'] = true;
        }

        // Car parking filter
        if (carParking === 'true') {
            query['amenities.carParking'] = true;
        }

        // Location filters
        if (district) {
            query['location.street'] = district;
        }
        if (ward) {
            query['location.ward'] = ward;
        }

        // Price range filter (handle new priceRange or legacy minPrice/maxPrice)
        let min = minPrice;
        let max = maxPrice;

        if (priceRange) {
            // Parse priceRange in millions format (e.g., '1.5-2' means 1.5M to 2M)
            const [rangeMin, rangeMax] = priceRange.split('-').map(parseFloat);
            min = rangeMin;
            max = rangeMax;
        }

        if (min || max) {
            query.priceMonthly = {};
            if (min) query.priceMonthly.$gte = Number(min);
            if (max) query.priceMonthly.$lte = Number(max);
        }

        // People capacity filter
        if (people) {
            query.maxPeople = { $gte: Number(people) };
        }

        // Furnitures filter (room must have all specified furnitures)
        if (furnitures) {
            const furnitureArray = Array.isArray(furnitures)
                ? furnitures
                : furnitures.split(',');
            query.furnitures = { $all: furnitureArray };
        }

        // Text search (Regex for partial matching)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { 'location.streetAddress': searchRegex },
                { 'location.ward': searchRegex },
                { 'location.street': searchRegex },
                { layout: searchRegex }
            ];
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const rooms = await Room.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await Room.countDocuments(query);

        res.json({
            rooms,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        res.json({ room });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        const room = await Room.create(req.body);

        res.status(201).json({
            room,
            message: 'Room created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res, next) => {
    try {
        let room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({
            room,
            message: 'Room updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Archive room
// @route   PATCH /api/rooms/:id/archive
// @access  Private/Admin
exports.archiveRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        res.json({
            room,
            message: 'Room archived successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Unarchive room
// @route   PATCH /api/rooms/:id/unarchive
// @access  Private/Admin
exports.unarchiveRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { isArchived: false },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        res.json({
            room,
            message: 'Room unarchived successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete room (soft delete)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                message: 'Room not found',
                code: 'ROOM_NOT_FOUND',
            });
        }

        // Soft delete by archiving
        room.isArchived = true;
        await room.save();

        res.json({
            message: 'Room deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
