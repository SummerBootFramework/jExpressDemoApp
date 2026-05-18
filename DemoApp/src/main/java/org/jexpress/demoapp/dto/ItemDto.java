package org.jexpress.demoapp.dto;

import org.summerboot.jexpress.util.FormatterUtil;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ItemDto {
    private String date;
    private String desc;
    private String amount;


    public ItemDto(LocalDate localDate, String desc, BigDecimal itemAmount) {
        this.date = localDate == null ? "" : localDate.toString();
        this.desc = desc;
        this.amount = FormatterUtil.formatCurrencyRetail(itemAmount);
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }
}
