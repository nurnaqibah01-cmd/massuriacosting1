<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"];
$title = $data["title"];
$customerName = $data["customerName"];
$customerContact = $data["customerContact"];
$customerAddress = $data["customerAddress"];
$pax = $data["pax"];
$eventDate = $data["eventDate"];

$totalMaterialCost = $data["totalMaterialCost"];
$labourCost = $data["labourCost"];
$overheadCost = $data["overheadCost"];
$totalCost = $data["totalCost"];
$profitMarginPercent = $data["profitMarginPercent"];
$profitAmount = $data["profitAmount"];
$sellingPrice = $data["sellingPrice"];

$sql = "INSERT INTO costing_reports 
(id, title, customer_name, customer_contact, customer_address, pax, event_date,
 total_material_cost, labour_cost, overhead_cost, total_cost, profit_margin_percent, profit_amount, selling_price)
VALUES
('$id', '$title', '$customerName', '$customerContact', '$customerAddress', '$pax', '$eventDate',
 '$totalMaterialCost', '$labourCost', '$overheadCost', '$totalCost', '$profitMarginPercent', '$profitAmount', '$sellingPrice')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Saved successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>
