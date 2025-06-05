// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "TaskManager",
    platforms: [
        .macOS(.v12),
        .iOS(.v15)
    ],
    products: [
        .executable(name: "TaskManager", targets: ["TaskManager"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "TaskManager",
            dependencies: [])
    ]
)
