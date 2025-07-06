package com.example.da_be.mapper;

import com.example.da_be.dto.response.ThongKeResponse;
import com.example.da_be.dto.response.TopSellingProductResponse;
import com.example.da_be.repository.OrderStatsProjection;
import com.example.da_be.repository.TopSellingProductProjection;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ThongKeMapper {

    ThongKeResponse toThongKeResponse(OrderStatsProjection stats);

    TopSellingProductResponse toTopSellingProductResponse(TopSellingProductProjection projection);

    List<TopSellingProductResponse> toTopSellingProductResponseList(List<TopSellingProductProjection> projections);

}
