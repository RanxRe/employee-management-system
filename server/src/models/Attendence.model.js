import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employees",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    // Current break, if the employee is on a break
    breakStartedAt: {
      type: Date,
      default: null,
    },

    breakStartedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    // History of completed breaks
    breaks: [
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true,
        },
        durationMs: {
          type: Number,
          required: true,
          min: 0,
        },
        startedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
        endedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
      },
    ],

    workingTimeAdjustments: [
      {
        adjustmentMs: {
          type: Number,
          required: true,
        },
        reason: {
          type: String,
          required: true,
          trim: true,
        },
        adjustedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          required: true,
        },
        adjustedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      default: "present",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
      distanceFromOffice: {
        type: Number,
        default: null,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },

    selfie: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
      capturedAt: {
        type: Date,
        default: null,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },

    checkOutLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
      distanceFromOffice: {
        type: Number,
        default: null,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

//compound unique index
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("attendances", attendanceSchema);

export default Attendance;
