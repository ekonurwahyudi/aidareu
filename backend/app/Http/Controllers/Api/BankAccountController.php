<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index(Request $request, $store)
    {
        return response()->json(['data' => [], 'message' => 'OK']);
    }

    public function store(Request $request, $store)
    {
        return response()->json(['message' => 'Created'], 201);
    }

    public function update(Request $request, $store, $bankAccount)
    {
        return response()->json(['message' => 'Updated']);
    }

    public function destroy($store, $bankAccount)
    {
        return response()->json(null, 204);
    }

    public function setPrimary($store, $bankAccount)
    {
        return response()->json(['message' => 'Primary account set']);
    }

    public function getBanks()
    {
        $banks = [
            ['code' => 'BCA', 'name' => 'Bank Central Asia'],
            ['code' => 'BRI', 'name' => 'Bank Rakyat Indonesia'],
            ['code' => 'MANDIRI', 'name' => 'Bank Mandiri'],
            ['code' => 'BNI', 'name' => 'Bank Negara Indonesia'],
            ['code' => 'CIMB', 'name' => 'CIMB Niaga'],
        ];

        return response()->json(['data' => $banks]);
    }
}